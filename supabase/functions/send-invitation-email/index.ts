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
    // Buat Supabase admin client menggunakan service_role key
    // (otomatis tersedia di Edge Functions sebagai env variable)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { to_email, inviter_name, family_name } = await req.json();

    if (!to_email) {
      return new Response(
        JSON.stringify({ error: "Email tujuan tidak boleh kosong" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Gunakan Supabase Auth untuk mengirim undangan
    // Ini akan mengirim email menggunakan SMTP bawaan Supabase
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      to_email,
      {
        data: {
          invited_by: inviter_name || "Seseorang",
          family_name: family_name || "Keluarga",
          full_name: to_email.split("@")[0],
        },
        redirectTo: undefined, // Bisa diisi URL deep link aplikasi nanti
      }
    );

    if (error) {
      console.error("Supabase invite error:", error);

      // Jika user sudah terdaftar, bukan error — artinya sudah punya akun
      if (error.message?.includes("already been registered") ||
        error.message?.includes("already exists")) {
        return new Response(
          JSON.stringify({
            success: true,
            already_registered: true,
            message: "User sudah terdaftar, undangan tersimpan di database"
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
          }
        );
      }

      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email undangan berhasil dikirim",
        user_id: data?.user?.id
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      }
    );
  }
});
