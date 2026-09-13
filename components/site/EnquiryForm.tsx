import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SectionHeading } from "@/components/site/Reveal";
import { EASE } from "@/lib/motion-presets";

const schema = z.object({
  parentName: z.string().min(2, "Please enter the parent's full name"),
  studentName: z.string().min(2, "Please enter the student's full name"),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email address"),
  grade: z.string().min(1, "Select a class"),
  session: z.string().min(1, "Select an academic session"),
  message: z.string().max(600, "Please keep it under 600 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

const GRADES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 11 }, (_, i) => `Grade ${i + 1}`),
];

export function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      parentName: "",
      studentName: "",
      phone: "",
      email: "",
      grade: "",
      session: "2026–27",
      message: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    await axios.post(`${process.env.NEXT_PUBLIC_BASE_URL}/inquiries`, {
        name: values.parentName,
        contact: values.phone,
        email: values.email,
        inquiryType: "Admission",
        message: `Student: ${values.studentName}\nClass: ${values.grade}\nSession: ${values.session}\n${values.message ?? ""}`,
    });

    setSubmitted(true);
  };

  return (
    <section id="enquiry" className="bg-secondary/40 py-20 lg:py-32">
      <div className="container-page">
        <SectionHeading
          eyebrow="Admission Enquiry"
          title="Start the conversation"
          description="Share a few details and the admissions team will get back to you with next steps, dates and a campus visit slot."
        />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="mx-auto mt-12 max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-lift sm:p-10"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.45, ease: EASE }}
                className="py-10 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="mx-auto grid size-16 place-items-center rounded-full bg-accent text-accent-foreground"
                >
                  <CheckCircle2 className="size-8" />
                </motion.span>
                <h3 className="mt-6 text-2xl">Enquiry received</h3>
                <p className="mx-auto mt-3 max-w-md text-sm text-muted-foreground">
                  Thank you. Our admissions office will contact you shortly. This is a demo form —
                  no data has been sent anywhere yet.
                </p>
                <Button
                  variant="outline"
                  className="mt-7 rounded-full"
                  onClick={() => {
                    form.reset();
                    setSubmitted(false);
                  }}
                >
                  Submit another enquiry
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-5 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="parentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="studentName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Student name</FormLabel>
                          <FormControl>
                            <Input placeholder="Full name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone</FormLabel>
                          <FormControl>
                            <Input inputMode="tel" placeholder="Contact number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="grade"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Class applying for</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a class" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {GRADES.map((g) => (
                                <SelectItem key={g} value={g}>
                                  {g}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="session"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Academic session</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select session" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="2026–27">2026–27</SelectItem>
                              <SelectItem value="2027–28">2027–28</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem className="sm:col-span-2">
                          <FormLabel>Message (optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={4}
                              placeholder="Tell us anything that would help us prepare for your visit."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="sm:col-span-2">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={form.formState.isSubmitting}
                        className="w-full rounded-full sm:w-auto"
                      >
                        {form.formState.isSubmitting ? (
                          <>
                            <Loader2 className="mr-1 size-4 animate-spin" />
                            Sending…
                          </>
                        ) : (
                          <>
                            <Send className="mr-1 size-4" />
                            Submit Enquiry
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
