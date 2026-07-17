// URL aplikasi diambil dari env agar email selalu menunjuk deployment aktif.
const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  'http://localhost:3000'
).replace(/\/+$/, '');
const LOGIN_URL = `${APP_URL}/login`;
const LOGO_URL = `${APP_URL}/dcota-logo.png`;

export function emailTemplate({ title, subtitle, message, ticketId }) {
  return `
  <!DOCTYPE html>
  <html lang="id">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
  </head>

  <body style="margin:0; padding:0; background-color:#f5f5f5; font-family: Arial, sans-serif;">

      <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5">
          <tr>
              <td align="center" style="padding:40px 15px;">

                  <!-- CARD -->
                  <table width="100%" border="0" cellspacing="0" cellpadding="0"
                      style="max-width:620px; background:#ffffff; border-radius:10px; overflow:hidden;
                      border:1px solid #eaeaea;">

                      <!-- HEADER -->
                      <tr>
                          <td style="padding:30px 25px; text-align:center; border-bottom:1px solid #efefef;">

                              <img src="${LOGO_URL}"
                                  width="110" alt="OMI Logo"
                                  style="display:block; margin:0 auto 20px;"/>

                              <h2 style="margin:0; font-size:20px; color:#222; font-weight:600;">
                                  ${title}
                              </h2>
                              <p style="margin:5px 0 0; font-size:14px; color:#777;">
                                  ${subtitle}
                              </p>
                          </td>
                      </tr>

                      <!-- BODY -->
                      <tr>
                          <td style="padding:30px 25px; color:#333; font-size:14px; line-height:1.7;">

                              ${message}

                              <!-- DETAIL BOX -->
                              <div style="
                                  background:#fafafa;
                                  border:1px solid #e5e5e5;
                                  padding:18px 20px;
                                  border-radius:8px;
                                  margin-top:22px;
                              ">

                                  ${
                                    ticketId
                                      ? `<p style="margin:0;">
                                            <strong style="color:#222;">ID Tiket:</strong> ${ticketId}
                                         </p>`
                                      : ""
                                  }
                              </div>

                          </td>
                      </tr>

                      <!-- CTA -->
                      <tr>
                          <td align="center" style="padding:0 25px 35px;">
                              <a href="${LOGIN_URL}" target="_blank"
                                  style="background-color:#1f2937; color:#ffffff; padding:12px 26px;
                                         text-decoration:none; border-radius:6px; font-weight:600;
                                         display:inline-block; font-size:14px;">
                                  Buka Sistem Helpdesk
                              </a>
                          </td>
                      </tr>

                      <!-- FOOTER -->
                      <tr>
                          <td align="center" style="
                              padding:20px;
                              background-color:#fafafa;
                              border-top:1px solid #eaeaea;
                              font-size:12px;
                              color:#999;
                          ">
                              <p style="margin:0;">Sistem Helpdesk OMI – Notifikasi Otomatis</p>
                              <p style="margin:6px 0 0; color:#bbb;">
                                  © ${new Date().getFullYear()} PT Onda Mega Integra
                              </p>
                          </td>
                      </tr>

                  </table>

              </td>
          </tr>
      </table>

  </body>
  </html>
  `;
}
