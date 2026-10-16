import { redirect } from "next/navigation";

export default function PublicDisclosureRedirect() {
  redirect("/mandatory-disclosure");
}
