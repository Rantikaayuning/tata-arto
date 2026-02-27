import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { to_email, inviter_name, family_name, is_existing_user } = await req.json();

    if (!to_email) {
      return new Response(
        JSON.stringify({ error: "Email tujuan tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
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
          JSON.stringify({ success: true, email_sent: false, message: "User ditambahkan tapi email gagal dikirim" }),
          { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, email_sent: true, message: "Notifikasi terkirim ke user yang sudah terdaftar" }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    } else {
      // User belum terdaftar — kirim undangan signup
      const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        to_email,
        {
          data: {
            invited_by: inviter_name || "Seseorang",
            family_name: family_name || "Keluarga",
            full_name: to_email.split("@")[0],
          },
        }
      );

      if (error) {
        console.error("Invite error:", error);

        if (error.message?.includes("already") || error.message?.includes("exists")) {
          return new Response(
            JSON.stringify({ success: true, already_registered: true }),
            { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
          );
        }

        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: "Email undangan berhasil dikirim", user_id: data?.user?.id }),
        { status: 200, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
    );
  }
});
