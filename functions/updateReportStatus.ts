import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 401 });
    }

    const { report_id, status, action_taken, moderator_notes } = await req.json();

    if (!report_id) {
      return Response.json({ error: 'Missing report_id' }, { status: 400 });
    }

    // Get the report
    const reports = await base44.asServiceRole.entities.UserReport.filter({ id: report_id });
    if (reports.length === 0) {
      return Response.json({ error: 'Report not found' }, { status: 404 });
    }
    const report = reports[0];

    // Update report
    await base44.asServiceRole.entities.UserReport.update(report_id, {
      status: status || report.status,
      action_taken: action_taken || report.action_taken,
      moderator_notes: moderator_notes || report.moderator_notes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    });

    // Send feedback to reporter
    if (!report.feedback_sent) {
      try {
        const reporterProfiles = await base44.asServiceRole.entities.UserProfile.filter({ 
          id: report.reporter_profile_id 
        });
        
        if (reporterProfiles.length > 0) {
          const reporterProfile = reporterProfiles[0];
          const reporterParents = await base44.asServiceRole.entities.ParentAccount.filter({ 
            id: reporterProfile.parent_account_id 
          });

          if (reporterParents.length > 0) {
            const actionMessage = {
              'content_removed': 'O conteúdo foi removido',
              'user_warned': 'O usuário foi advertido',
              'user_suspended': 'O usuário foi suspenso',
              'parent_notified': 'Os responsáveis foram notificados',
              'none': 'Nenhuma ação foi necessária',
              'escalated_to_admin': 'O caso foi escalado para análise administrativa'
            }[action_taken] || 'Ação apropriada foi tomada';

            await base44.integrations.Core.SendEmail({
              to: reporterParents[0].parent_email,
              subject: '✅ Atualização da Denúncia - Colour Me Brazil',
              body: `Olá ${reporterParents[0].parent_name},

A denúncia enviada pelo perfil "${reporterProfile.child_name}" foi revisada.

Status: ${status === 'action_taken' ? 'Ação Realizada' : 'Resolvido'}
Ação: ${actionMessage}

${moderator_notes ? `\nNotas do moderador: ${moderator_notes}` : ''}

Obrigado por ajudar a manter nossa comunidade segura!

Equipe Colour Me Brazil`
            });

            await base44.asServiceRole.entities.UserReport.update(report_id, {
              feedback_sent: true
            });
          }
        }
      } catch (error) {
        console.error('Error sending feedback:', error);
      }
    }

    return Response.json({
      success: true,
      message: 'Report updated and feedback sent'
    });

  } catch (error) {
    console.error('Update report error:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});