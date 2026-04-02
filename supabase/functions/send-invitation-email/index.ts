import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { to_email, inviter_name, family_name, is_existing_user } =
      await req.json();

    if (!to_email) {
      return new Response(
        JSON.stringify({ error: "Email tujuan tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    if (is_existing_user) {
      // User sudah terdaftar — kirim magic link sebagai notifikasi
      // Magic link akan membawa user langsung masuk ke app
      const { error } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email: to_email,
      });

      if (error) {
        console.error("Magic link error:", error);
        // Jangan gagalkan — user sudah ditambahkan ke keluarga
        return new Response(
          JSON.stringify({
            success: true,
            email_sent: false,
            message: "User ditambahkan tapi email gagal dikirim",
          }),
          {
            status: 200,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          email_sent: true,
          message: "Notifikasi terkirim ke user yang sudah terdaftar",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    } else {
      // User belum terdaftar — kirim undangan dengan custom email ke halaman download
      // Buat magic link terlebih dahulu
      const { data: linkData, error: linkError } =
        await supabaseAdmin.auth.admin.generateLink({
          type: "magiclink",
          email: to_email,
          options: {
            data: {
              invited_by: inviter_name || "Seseorang",
              family_name: family_name || "Keluarga",
              full_name: to_email.split("@")[0],
            },
            redirectTo: `https://tataarto.netlify.app/get-app.html?source=email&familyId=${family_name || "unknown"}`,
          },
        });

      if (linkError) {
        console.error("Magic link generation error:", linkError);
        return new Response(JSON.stringify({ error: linkError.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      // Kirim email custom dengan template kita
      const magicLink =
        linkData.properties?.action_link || linkData.properties?.email_otp;
      if (!magicLink) {
        console.error("No magic link generated");
        return new Response(
          JSON.stringify({ error: "Failed to generate magic link" }),
          {
            status: 500,
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          },
        );
      }

      // Kirim email menggunakan Supabase email API dengan template custom
      const emailHtml = `
<!doctype html>
<html lang="id">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <style>
      body {
        font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f7f8fa;
      }
      .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 4px 16px rgba(52, 59, 113, 0.1);
      }
      .header {
        background: linear-gradient(135deg, #343b71 0%, #4a5296 100%);
        padding: 40px 20px;
        text-align: center;
        color: white;
      }
      .header h1 {
        margin: 0;
        font-size: 32px;
        font-weight: 900;
        letter-spacing: -1px;
      }
      .header p {
        margin: 8px 0 0 0;
        font-size: 13px;
        opacity: 0.9;
      }
      .content {
        padding: 40px 32px;
      }
      .greeting {
        font-size: 16px;
        color: #1f2937;
        margin-bottom: 16px;
        font-weight: 600;
      }
      .message {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 24px;
      }
      .highlight {
        color: #343b71;
        font-weight: 600;
      }
      .features {
        background: #f9fafb;
        border-radius: 12px;
        padding: 24px;
        margin: 24px 0;
      }
      .features h3 {
        margin: 0 0 16px 0;
        font-size: 14px;
        color: #1f2937;
        font-weight: 700;
      }
      .feature-list {
        list-style: none;
        padding: 0;
        margin: 0;
      }
      .feature-list li {
        padding: 8px 0;
        font-size: 13px;
        color: #6b7280;
        display: flex;
        align-items: center;
      }
      .feature-list li:before {
        content: "✓";
        color: #10b981;
        font-weight: 700;
        margin-right: 10px;
        font-size: 14px;
      }
      .cta-container {
        margin: 32px 0;
        text-align: center;
      }
      .cta-button {
        display: inline-block;
        background: linear-gradient(135deg, #343b71 0%, #4a5296 100%);
        color: white;
        padding: 14px 40px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 700;
        font-size: 15px;
        box-shadow: 0 4px 12px rgba(52, 59, 113, 0.3);
      }
      .cta-button:hover {
        text-decoration: none;
        opacity: 0.95;
      }
      .footer {
        padding: 20px 32px;
        border-top: 1px solid #f3f4f6;
        text-align: center;
        background: #f9fafb;
      }
      .footer p {
        margin: 8px 0;
        font-size: 11px;
        color: #9ca3af;
      }
    </style>
  </head>
  <body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" bgcolor="#F7F8FA">
          <table class="container" width="100%" cellpadding="0" cellspacing="0" border="0">
            <!-- Header -->
            <tr>
              <td class="header">
                <h1>tata arto.</h1>
                <p>Kelola Keuangan Bersama</p>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td class="content">
                <p class="greeting">Halo! 👋</p>

                <p class="message">
                  Anda telah diundang untuk bergabung ke
                  <span class="highlight">${family_name || "Keluarga"}</span> — aplikasi pencatatan
                  keuangan keluarga yang mudah dan transparan.
                </p>

                <p class="message">
                  Dengan tata arto, Anda bisa mengelola keuangan keluarga
                  bersama dengan lebih baik dan terorganisir.
                </p>

                <!-- Features -->
                <div class="features">
                  <h3>Fitur Unggulan:</h3>
                  <ul class="feature-list">
                    <li>💰 Catat pemasukan dan pengeluaran dengan mudah</li>
                    <li>👨‍👩‍👧‍👦 Kelola keuangan keluarga bersama-sama</li>
                    <li>👛 Dukungan multi dompet dan kantong</li>
                    <li>📊 Laporan bulanan yang rinci dan mendalam</li>
                  </ul>
                </div>

                <!-- CTA Button -->
                <div class="cta-container">
                  <a href="${magicLink}" class="cta-button">📱 Download Aplikasi & Bergabung</a>
                </div>

                <p class="message">
                  Klik tombol di atas untuk membuat akun Anda dan segera
                  bergabung dengan keluarga. Proses pendaftaran hanya
                  membutuhkan waktu kurang dari 1 menit.
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td class="footer">
                <p>© 2026 tata arto. — Semua Hak Dilindungi</p>
                <p>Jika Anda merasa ini adalah kesalahan, abaikan email ini.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

      // Kirim email menggunakan Supabase
      const { error: emailError } = await supabaseAdmin.auth.admin.sendRawEmail(
        {
          to: to_email,
          subject: `Undangan Bergabung ke ${family_name || "Keluarga"}`,
          html: emailHtml,
        },
      );

      if (emailError) {
        console.error("Email send error:", emailError);
        return new Response(JSON.stringify({ error: emailError.message }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: "Email undangan berhasil dikirim",
          user_id: linkData?.user?.id,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        },
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
});
