import type { HttpContext } from '@adonisjs/core/http'
import AuthMail from '#models/auth_mail';
import { inject } from '@adonisjs/core';
import MailProvider from '#providers/mail_provider';

@inject()
export default class MailController {
    constructor(protected mail_provider: MailProvider) { }

    async getGmail({ request, auth, session, response }: HttpContext) {
        const oauth_2_client = this.mail_provider.authOauthGmail();
        const url = this.mail_provider.generateAuthUrl(oauth_2_client);
        let mails_unread = [];
        let  mails_read = [];
        if (!request.input('code')) {
            return response.safeStatus(200).json({ url: url });

        } else {
            const { tokens } = await oauth_2_client.getToken(request.input('code'));

            oauth_2_client.setCredentials(tokens);

            if (tokens.refresh_token) {
                const refresh_token = this.mail_provider.encryptData(tokens.refresh_token);
                console.log(session.get('gmail'));
                await AuthMail.updateOrCreate({email: session.get('gmail')},{ user_id: auth.user?.$attributes.id, email: session.get('gmail'), refresh_token: refresh_token });
            }

            const threads_unread = await this.mail_provider.getThreadsUnread(oauth_2_client, session);
            const threads_read  = await this.mail_provider.getThreadsRead(oauth_2_client, session);
            for (const thread of threads_unread.data.threads) {
                console.log(thread.id);
                mails_unread.push(await this.mail_provider.getMail(oauth_2_client, session, thread.id, false));
            }
            for (const thread of threads_read.data.threads) {
                mails_read.push(await this.mail_provider.getMail(oauth_2_client, session, thread.id, true));
            }
            session.put('threads_read', mails_read);
            session.put('threads_unread', mails_unread);
            return response.redirect('http://localhost:5173/mails');
        }
    }

    async getGmailv2({ request, auth, session, response }: HttpContext) {
        const oauth_2_client = this.mail_provider.authOauthGmail();
        const url = this.mail_provider.generateAuthUrl(oauth_2_client);
        let mails_unread = [];
        let  mails_read = [];
        if (!request.input('code')) {
            return response.safeStatus(200).json({ url: url });

        } else {
            const { tokens } = await oauth_2_client.getToken(request.input('code'));

            oauth_2_client.setCredentials(tokens);

            if (tokens.refresh_token) {
                const refresh_token = this.mail_provider.encryptData(tokens.refresh_token);
                console.log(session.get('gmail'));
                await AuthMail.updateOrCreate({email: session.get('gmail')},{ user_id: auth.user?.$attributes.id, email: session.get('gmail'), refresh_token: refresh_token });
            }

            const threads_unread = await this.mail_provider.getThreadsUnread(oauth_2_client, session);
            const threads_read  = await this.mail_provider.getThreadsRead(oauth_2_client, session);
            for (const thread of threads_unread.data.threads) {
                console.log(thread.id);
                mails_unread.push(await this.mail_provider.getMail(oauth_2_client, session, thread.id, false));
            }
            for (const thread of threads_read.data.threads) {
                mails_read.push(await this.mail_provider.getMail(oauth_2_client, session, thread.id, true));
            }
            session.put('threads_read', mails_read);
            session.put('threads_unread', mails_unread);
            return response.redirect('http://localhost:5002');
        }
    }

    async identifierGmail({ request, auth, session, response }: HttpContext) {
        if (session.has('gmail')) {
            session.forget('gmail');
        }
        session.put('gmail', request.input('email'));

        return response.safeStatus(200).json({ message: 'Gmail added!' });
    }
/*    async getMail({ request, auth, session, response }: HttpContext) {
        if (!session.has('gmail')) {
            return response.abort('Gmail not found!');
        }

        const id_mail = request.param('id');
        const oauth_2_client = this.mail_provider.authOauthGmail();
        const authMail = await AuthMail.findByOrFail('user_id', auth.user?.$attributes.id);

        const refresh_token: string | null = this.mail_provider.decryptData(authMail.refresh_token);

        oauth_2_client.setCredentials({ refresh_token: refresh_token });

        const message = await this.mail_provider.getMail(oauth_2_client, session, id_mail);

        return response.safeStatus(200).json({ message: message });

    }
*/

    async whoamiGmail({ request, auth, session, response }: HttpContext) {
        if (!session.has('gmail')) {
            return response.abort('Gmail not found!');
        }

        return response.safeStatus(200).json({ email: session.get('gmail') });
    }

    async getThreads({ request, auth, session, response }: HttpContext) {
        if (!session.has('threads_unread') && !session.has('threads_read')) {
            return response.abort('threads not found!');
        }
        let threads:any = [];
        threads.push(session.get('threads_unread'));
        threads.push(session.get('threads_read'));
        return response.safeStatus(200).json({ threads: threads });
    }

}