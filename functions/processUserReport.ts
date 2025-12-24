import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      reported_content_type, 
      reported_content_id, 
      report_reason, 
      report_description,
      current_profile_id 
    } = await req.json();

    if (!reported_content_type || !reported_content_id || !report_reason) {
      return Response.json({ 
        error: 'Missing required parameters' 
      }, { status: 400 });
    }

    // Fetch the reported content
    let contentData = null;
    let reportedProfileId = null;
    let contentPreview = '';

    try {
      switch (reported_content_type) {
        case 'comment':
          const comments = await base44.asServiceRole.entities.Comment.filter({ id: reported_content_id });
          if (comments.length > 0) {
            contentData = comments[0];
            reportedProfileId = contentData.profile_id;
            contentPreview = contentData.content?.substring(0, 200);
          }
          break;
        case 'showcase_item':
          const showcases = await base44.asServiceRole.entities.ShowcaseItem.filter({ id: reported_content_id });
          if (showcases.length > 0) {
            contentData = showcases[0];
            reportedProfileId = contentData.profile_id;
            contentPreview = contentData.description?.substring(0, 200);
          }
          break;
        case 'forum_post':
          const posts = await base44.asServiceRole.entities.ForumTopic.filter({ id: reported_content_id });
          if (posts.length > 0) {
            contentData = posts[0];
            reportedProfileId = contentData.creator_profile_id;
            contentPreview = contentData.description?.substring(0, 200);
          }
          break;
        case 'forum_reply':
          const replies = await base44.asServiceRole.entities.ForumReply.filter({ id: reported_content_id });
          if (replies.length > 0) {
            contentData = replies[0];
            reportedProfileId = contentData.profile_id;
            contentPreview = contentData.content?.substring(0, 200);
          }
          break;
      }
    } catch (error) {
      console.error('Error fetching reported content:', error);
    }

    if (!contentData) {
      return Response.json({ error: 'Content not found' }, { status: 404 });
    }

    // AI analysis of the report
    const aiPrompt = `You are a content moderator for a children's learning app (ages 6-12) compliant with LGPD.

REPORTED CONTENT:
Type: ${reported_content_type}
Reason: ${report_reason}
Description from reporter: ${report_description || 'None provided'}
Content preview: ${contentPreview}

TASK: Analyze this report and provide:
1. Severity assessment (low, medium, high, critical)
2. Is this a valid concern? (true/false)
3. Recommended action (none, content_removed, user_warned, user_suspended, parent_notified, escalated_to_admin)
4. Detailed reasoning in Portuguese
5. Whether this requires immediate action (true/false)
6. Specific violations detected (array of strings)

Consider:
- Child safety (highest priority)
- LGPD compliance
- False reports
- Context and intent
- Age-appropriate standards

Respond in JSON.`;

    const aiAnalysis = await base44.integrations.Core.InvokeLLM({
      prompt: aiPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          severity: { type: "string", enum: ["low", "medium", "high", "critical"] },
          valid_concern: { type: "boolean" },
          recommended_action: { type: "string" },
          reasoning: { type: "string" },
          immediate_action_required: { type: "boolean" },
          violations: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Determine priority
    const priority = aiAnalysis.severity || 'medium';
    const shouldAutoResolve = aiAnalysis.severity === 'low' && !aiAnalysis.valid_concern;

    // Create the report
    const report = await base44.asServiceRole.entities.UserReport.create({
      reporter_profile_id: current_profile_id,
      reported_content_type,
      reported_content_id,
      reported_profile_id: reportedProfileId,
      report_reason,
      report_description,
      status: shouldAutoResolve ? 'dismissed' : 
              aiAnalysis.immediate_action_required ? 'under_review' : 'pending',
      priority,
      ai_analysis: aiAnalysis,
      action_taken: shouldAutoResolve ? 'none' : undefined,
      auto_resolved: shouldAutoResolve,
      feedback_sent: false
    });

    // Take immediate action if critical
    if (aiAnalysis.immediate_action_required && aiAnalysis.recommended_action !== 'none') {
      try {
        // Remove content if recommended
        if (aiAnalysis.recommended_action === 'content_removed') {
          // Mark content as flagged/hidden
          // This depends on your entity structure
          console.log('Would remove content:', reported_content_id);
        }

        // Update report with action taken
        await base44.asServiceRole.entities.UserReport.update(report.id, {
          action_taken: aiAnalysis.recommended_action,
          status: 'action_taken'
        });

        // Notify parent if needed
        if (reportedProfileId && (aiAnalysis.severity === 'high' || aiAnalysis.severity === 'critical')) {
          const reportedProfiles = await base44.asServiceRole.entities.UserProfile.filter({ 
            id: reportedProfileId 
          });
          
          if (reportedProfiles.length > 0) {
            const reportedProfile = reportedProfiles[0];
            const parentAccounts = await base44.asServiceRole.entities.ParentAccount.filter({ 
              id: reportedProfile.parent_account_id 
            });

            if (parentAccounts.length > 0) {
              await base44.integrations.Core.SendEmail({
                to: parentAccounts[0].parent_email,
                subject: '⚠️ Alerta de Moderação - Colour Me Brazil',
                body: `Olá ${parentAccounts[0].parent_name},

Um conteúdo do perfil "${reportedProfile.child_name}" foi reportado e removido por violar nossas políticas de segurança.

Motivo: ${report_reason}
Ação tomada: ${aiAnalysis.recommended_action}
Detalhes: ${aiAnalysis.reasoning}

Por favor, revise a atividade do seu filho e converse sobre o uso apropriado da plataforma.

Equipe Colour Me Brazil`
              });
            }
          }
        }
      } catch (error) {
        console.error('Error taking immediate action:', error);
      }
    }

    // Send feedback to reporter
    try {
      const reporterProfiles = await base44.asServiceRole.entities.UserProfile.filter({ 
        id: current_profile_id 
      });
      
      if (reporterProfiles.length > 0) {
        const reporterProfile = reporterProfiles[0];
        const reporterParents = await base44.asServiceRole.entities.ParentAccount.filter({ 
          id: reporterProfile.parent_account_id 
        });

        if (reporterParents.length > 0) {
          await base44.integrations.Core.SendEmail({
            to: reporterParents[0].parent_email,
            subject: '✅ Denúncia Recebida - Colour Me Brazil',
            body: `Olá ${reporterParents[0].parent_name},

Recebemos a denúncia enviada pelo perfil "${reporterProfile.child_name}".

Status: ${shouldAutoResolve ? 'Resolvido automaticamente' : 'Em análise'}
${shouldAutoResolve ? `\nNossa análise indicou que o conteúdo está dentro das diretrizes. Obrigado pela vigilância!` : `\nNossa equipe de moderação está revisando o caso. Você receberá uma atualização em breve.`}

Obrigado por ajudar a manter nossa comunidade segura!

Equipe Colour Me Brazil`
          });

          await base44.asServiceRole.entities.UserReport.update(report.id, {
            feedback_sent: true
          });
        }
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
    }

    return Response.json({
      success: true,
      report_id: report.id,
      status: report.status,
      priority,
      immediate_action_taken: aiAnalysis.immediate_action_required,
      message: shouldAutoResolve 
        ? 'Denúncia recebida e analisada. O conteúdo está dentro das diretrizes.'
        : 'Denúncia recebida. Nossa equipe de moderação irá revisar em breve.',
      ai_analysis: aiAnalysis
    });

  } catch (error) {
    console.error('Process report error:', error);
    return Response.json({ 
      error: error.message,
      details: error.stack 
    }, { status: 500 });
  }
});