import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profile_id, content_type, content, image_url } = await req.json();

    if (!profile_id || !content_type) {
      return Response.json({ 
        error: 'Missing required parameters: profile_id, content_type' 
      }, { status: 400 });
    }

    // Get user profile and parent account for settings
    const profiles = await base44.asServiceRole.entities.UserProfile.filter({ 
      id: profile_id 
    });
    
    if (profiles.length === 0) {
      return Response.json({ error: 'Profile not found' }, { status: 404 });
    }
    
    const profile = profiles[0];
    const parentAccounts = await base44.asServiceRole.entities.ParentAccount.filter({
      id: profile.parent_account_id
    });
    
    if (parentAccounts.length === 0) {
      return Response.json({ error: 'Parent account not found' }, { status: 404 });
    }
    
    const parentAccount = parentAccounts[0];

    // Build moderation prompt
    const moderationPrompt = `You are an advanced content moderation AI for a children's educational app (ages 6-12) that must comply with LGPD (Brazilian data protection law).

Analyze the following ${content_type} content for:
1. **Profanity or inappropriate language** - swear words, slurs, vulgar expressions
2. **Violence, threats, or aggressive behavior** - explicit violence, weapons, intimidation
3. **Personal identifying information (PII)** - names, addresses, phone numbers, emails, school names, parents' info
4. **Predatory behavior** - grooming patterns, requests for private contact, manipulation tactics
5. **Bullying or harassment** - targeted attacks, exclusion, mockery
6. **Sexual content or innuendo** - adult themes, inappropriate suggestions
7. **Hate speech or discrimination** - racism, sexism, homophobia, xenophobia
8. **Self-harm or dangerous activities** - cutting, suicide references, dangerous challenges
9. **Misinformation that could harm children** - medical misinformation, dangerous advice
10. **Commercial solicitation or advertising** - product placement, phishing, scams

Content to moderate:
${content || 'N/A'}
${image_url ? `Image URL: ${image_url}` : ''}

CRITICAL LGPD COMPLIANCE:
- Flag any content that exposes personal data of minors
- Be extra cautious with location data, school information, or family details
- Consider cultural context (Brazilian Portuguese nuances)
- Distinguish between age-appropriate expression and genuine risk

CONTEXT ANALYSIS:
- Evaluate intent behind the content
- Consider if it's playful language vs harmful
- Check for coded language or euphemisms
- Assess severity based on child safety standards

Respond with a JSON object with this exact structure:
{
  "risk_level": "none|low|medium|high|critical",
  "moderation_result": "approved|flagged|blocked",
  "detected_issues": ["issue1", "issue2"],
  "reasoning": "Brief explanation in Portuguese suitable for parents",
  "action_recommendation": "allow|warn_child|notify_parent|block_content|escalate_to_human",
  "confidence_score": 0-100,
  "requires_human_review": true/false
}`;

    // Call AI for moderation
    const moderationResponse = await base44.integrations.Core.InvokeLLM({
      prompt: moderationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          risk_level: { type: "string" },
          moderation_result: { type: "string" },
          detected_issues: { type: "array", items: { type: "string" } },
          reasoning: { type: "string" },
          action_recommendation: { type: "string" },
          confidence_score: { type: "number" },
          requires_human_review: { type: "boolean" }
        }
      },
      file_urls: image_url ? [image_url] : undefined
    });

    const result = moderationResponse;
    
    // Determine if parent needs approval
    const needsApproval = parentAccount.content_approval_required && 
                         (result.risk_level !== 'none' || result.moderation_result !== 'approved');
    
    // Create moderation event record
    const moderationEvent = await base44.asServiceRole.entities.ModerationEvent.create({
      profile_id,
      parent_account_id: profile.parent_account_id,
      content_type,
      content_preview: content ? content.substring(0, 200) : (image_url || 'No preview'),
      moderation_result: result.moderation_result,
      risk_level: result.risk_level,
      detected_issues: result.detected_issues || [],
      ai_reasoning: result.reasoning,
      parent_notified: needsApproval || result.risk_level === 'high' || result.risk_level === 'critical',
      action_taken: result.action_recommendation
    });

    // Send notification to parent if needed
    if (needsApproval || result.risk_level === 'high' || result.risk_level === 'critical') {
      try {
        await base44.integrations.Core.SendEmail({
          to: parentAccount.parent_email,
          subject: `🚨 Alerta de Moderação - ${profile.child_name}`,
          body: `Olá ${parentAccount.parent_name},

Um conteúdo criado por ${profile.child_name} foi sinalizado pelo nosso sistema de moderação automática.

**Tipo de conteúdo:** ${content_type}
**Nível de risco:** ${result.risk_level}
**Motivo:** ${result.reasoning}

${needsApproval ? '⚠️ Este conteúdo requer sua aprovação antes de ser publicado.' : '✓ O conteúdo foi automaticamente bloqueado por segurança.'}

Acesse o Portal dos Pais para revisar: ${Deno.env.get('APP_URL') || 'https://app.example.com'}/ParentPortal

Atenciosamente,
Equipe Colour Me Brazil`
        });
      } catch (emailError) {
        console.error('Failed to send parent notification:', emailError);
      }
    }

    return Response.json({
      success: true,
      moderation_result: result.moderation_result,
      risk_level: result.risk_level,
      detected_issues: result.detected_issues,
      reasoning: result.reasoning,
      needs_parent_approval: needsApproval,
      blocked: result.moderation_result === 'blocked' || 
               (needsApproval && !['none', 'low'].includes(result.risk_level)),
      moderation_event_id: moderationEvent.id
    });

  } catch (error) {
    console.error('Moderation error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});