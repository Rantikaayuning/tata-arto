import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return new Response(
        JSON.stringify({ error: "Email service tidak dikonfigurasi" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    const { to_email, inviter_name, family_name, is_existing_user } =
      await req.json();

    if (!to_email) {
      return new Response(
        JSON.stringify({ error: "Email tujuan tidak boleh kosong" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    const familyLabel = family_name || "Keluarga";
    const inviterLabel = inviter_name || "Seseorang";

    const subject = is_existing_user
      ? `Anda telah ditambahkan ke ${familyLabel} di Tata Arto`
      : `Undangan Bergabung ke ${familyLabel} — Tata Arto`;

    const ctaUrl = is_existing_user
      ? "https://tataarto.netlify.app/get-app.html"
      : "https://tataarto.netlify.app/get-app.html?source=email-invitation";

    const ctaText = is_existing_user
      ? "📱 Buka Aplikasi Tata Arto"
      : "📱 Download Aplikasi & Bergabung";

    const bodyMessage = is_existing_user
      ? `<b>${inviterLabel}</b> telah menambahkan Anda ke <span class="highlight">${familyLabel}</span>. Buka aplikasi Tata Arto untuk melihat data keuangan keluarga bersama.`
      : `<b>${inviterLabel}</b> mengundang Anda untuk bergabung ke <span class="highlight">${familyLabel}</span> — aplikasi pencatatan keuangan keluarga yang mudah dan transparan.`;

    const emailHtml = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body { font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f7f8fa; }
      .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(52,59,113,0.10); }
      .header { background: linear-gradient(135deg, #343b71 0%, #4a5296 100%); padding: 40px 20px; text-align: center; color: white; }
      .header h1 { margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; }
      .header p { margin: 8px 0 0 0; font-size: 13px; opacity: 0.85; }
      .content { padding: 40px 32px; }
      .greeting { font-size: 18px; color: #1f2937; margin-bottom: 16px; font-weight: 700; text-align: center; }
      .message { font-size: 15px; color: #4b5563; line-height: 1.7; margin-bottom: 24px; }
      .highlight { color: #343b71; font-weight: 700; }
      .features { background: #f9fafb; border-radius: 12px; padding: 24px; margin: 24px 0; border: 1px solid #e5e7eb; }
      .features h3 { margin: 0 0 14px 0; font-size: 14px; color: #1f2937; font-weight: 700; }
      .feature-list { list-style: none; padding: 0; margin: 0; }
      .feature-list li { padding: 7px 0; font-size: 13px; color: #6b7280; }
      .cta-container { margin: 32px 0; text-align: center; }
      .cta-button { display: inline-block; background: linear-gradient(135deg, #343b71 0%, #4a5296 100%); color: white !important; padding: 15px 44px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; box-shadow: 0 4px 14px rgba(52,59,113,0.3); }
      .footer { padding: 24px 32px; border-top: 1px solid #f3f4f6; text-align: center; background: #f9fafb; }
      .footer p { margin: 6px 0; font-size: 11px; color: #9ca3af; }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f8fa;padding:20px 0;">
      <tr><td align="center">
        <table class="container" width="600" cellpadding="0" cellspacing="0" border="0">
          <tr><td class="header">
            <h1>tata arto.</h1>
            <p>Kelola Keuangan Bersama</p>
          </td></tr>
          <tr><td class="content">
            <p class="greeting" style="text-align: center;">Halo! 👋</p>
            <p class="message">${bodyMessage}</p>
            <p class="message">Dengan tata arto, Anda bisa mengelola keuangan keluarga bersama dengan lebih mudah dan terorganisir.</p>
            <div class="features">
              <h3>Fitur Unggulan:</h3>
              <ul class="feature-list">
                <li>💰 Catat pemasukan dan pengeluaran dengan mudah</li>
                <li>👨‍👩‍👧‍👦 Kelola keuangan keluarga bersama-sama</li>
                <li>👛 Dukungan multi dompet dan kantong</li>
                <li>📊 Laporan bulanan yang rinci dan mendalam</li>
              </ul>
            </div>
            <div class="cta-container">
              <a href="${ctaUrl}" class="cta-button">${ctaText}</a>
            </div>
            <p class="message" style="font-size:13px;color:#9ca3af;">Jika Anda merasa ini adalah kesalahan, abaikan email ini.</p>
          </td></tr>
          <tr><td class="footer">
            <p>© 2026 tata arto. — Semua Hak Dilindungi</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;

    // Kirim via Resend API
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Tata Arto <onboarding@resend.dev>",
        to: [to_email],
        subject,
        html: emailHtml,
      }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({
          error: resendData?.message || "Gagal mengirim email",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...CORS_HEADERS },
        },
      );
    }

    console.log("Email sent successfully:", resendData.id);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email undangan berhasil dikirim",
        email_id: resendData.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }
});
