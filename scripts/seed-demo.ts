import { createSupabaseAdminClient } from "../lib/supabase/admin";

const demoUsers = [
  { email: "alex@friendpay.local", password: "friendpay123", displayName: "Alex", pin: "1111", balancePence: 25000, cardCode: "CARD-ALEX-01" },
  { email: "sam@friendpay.local", password: "friendpay123", displayName: "Sam", pin: "2222", balancePence: 23000, cardCode: "CARD-SAM-02" },
  { email: "priya@friendpay.local", password: "friendpay123", displayName: "Priya", pin: "3333", balancePence: 21000, cardCode: "CARD-PRIYA-03" },
  { email: "ben@friendpay.local", password: "friendpay123", displayName: "Ben", pin: "4444", balancePence: 19000, cardCode: "CARD-BEN-04" },
  { email: "maya@friendpay.local", password: "friendpay123", displayName: "Maya", pin: "5555", balancePence: 27000, cardCode: "CARD-MAYA-05" },
  { email: "leo@friendpay.local", password: "friendpay123", displayName: "Leo", pin: "6666", balancePence: 18000, cardCode: "CARD-LEO-06" },
];

async function main() {
  const supabase = createSupabaseAdminClient();
  const { data: existingUsersData, error: listError } = await supabase.auth.admin.listUsers();

  if (listError) {
    throw listError;
  }

  const existingUsers = existingUsersData.users;

  for (const user of demoUsers) {
    const existing = existingUsers.find((entry) => entry.email === user.email);

    const authUser =
      existing ??
      (
        await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
        })
      ).data.user;

    if (!authUser) {
      throw new Error(`Unable to create or load auth user for ${user.email}`);
    }

    const { error } = await supabase.rpc("admin_seed_profile", {
      target_user_id: authUser.id,
      email_input: user.email,
      display_name_input: user.displayName,
      pin_input: user.pin,
      balance_pence_input: user.balancePence,
      card_code_input: user.cardCode,
    });

    if (error) {
      throw error;
    }
  }

  console.log("Demo users seeded:");
  demoUsers.forEach((user) => {
    console.log(`- ${user.displayName}: ${user.email} / ${user.password} / PIN ${user.pin} / ${user.cardCode}`);
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
