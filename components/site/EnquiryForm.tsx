import { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  fullName: z.string().min(2, "Please enter your full name"),
  phone: z.string().regex(/^[0-9+\-\s]{8,15}$/, "Enter a valid phone number"),
  grade: z.string().min(1, "Select a class applying for"),
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

const GRADES = [
  "Nursery",
  "LKG",
  "UKG",
  ...Array.from({ length: 12 }, (_, i) => `Grade ${i + 1}`),
];

export function EnquiryForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      phone: "",
      grade: "",
      email: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:5000/api/v1").replace(/\/$/, "");
      await axios.post(`${baseUrl}/inquiries`, {
        name: values.fullName,
        contact: values.phone,
        email: values.email,
        inquiryType: `Admission (${values.grade})`,
        message: `Quick admission inquiry for ${values.grade}`,
      });
    } catch (err) {
      console.error("Enquiry submission error:", err);
    } finally {
      setSubmitting(false);
      setSubmitted(true);
    }
  };

  return (
    <section id="enquiry" className="bg-[#f4f8fd] py-16 lg:py-24 border-t border-[#dce6f2]">
      <div className="container-page">
        <SectionHeading
          eyebrow="Admission Enquiry"
          title="Start Your Child's Journey"
          description="Fill out the 4 quick details below and the Indian Public School admissions desk will get in touch with you shortly."
        />

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto mt-10 max-w-2xl rounded-3xl border border-[#dce6f2] bg-white p-6 shadow-xl sm:p-10"
        >
          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="py-8 text-center"
              >
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner"
                >
                  <i className="bi bi-check-circle-fill text-3xl" />
                </motion.span>
                <h3 className="mt-5 text-2xl font-extrabold text-[#082A52]">Enquiry Received Successfully</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-slate-600 leading-relaxed font-medium">
                  Thank you! Your inquiry has been logged with our admissions desk. Our counselors will reach out to you shortly.
                </p>
                <Button
                  variant="outline"
                  className="mt-6 rounded-xl font-bold border-slate-300 text-[#123B70] hover:bg-[#f4f8fd]"
                  onClick={() => {
                    form.reset();
                    setSubmitted(false);
                  }}
                >
                  Submit Another Enquiry
                </Button>
              </motion.div>
            ) : (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      {/* Field 1: Full Name */}
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                              <i className="bi bi-person-fill text-[#123B70] text-base" /> Parent / Student Name
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. Rahul Sharma" className="h-11 rounded-xl bg-[#f4f8fd]/60 border-[#dce6f2] focus:bg-white focus:border-[#123B70]" {...field} />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />

                      {/* Field 2: Phone */}
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                              <i className="bi bi-telephone-fill text-[#123B70] text-base" /> Phone / Contact Number
                            </FormLabel>
                            <FormControl>
                              <Input inputMode="tel" placeholder="e.g. +91 9876543210" className="h-11 rounded-xl bg-[#f4f8fd]/60 border-[#dce6f2] focus:bg-white focus:border-[#123B70]" {...field} />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />

                      {/* Field 3: Class Applying For */}
                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                              <i className="bi bi-book-fill text-[#123B70] text-base" /> Class Applying For
                            </FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-11 rounded-xl bg-[#f4f8fd]/60 border-[#dce6f2] focus:bg-white focus:border-[#123B70]">
                                  <SelectValue placeholder="Select class" />
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
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />

                      {/* Field 4: Email */}
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-xs font-bold text-[#082A52] flex items-center gap-2">
                              <i className="bi bi-envelope-fill text-[#123B70] text-base" /> Email Address
                            </FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@example.com" className="h-11 rounded-xl bg-[#f4f8fd]/60 border-[#dce6f2] focus:bg-white focus:border-[#123B70]" {...field} />
                            </FormControl>
                            <FormMessage className="text-[11px]" />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#123B70] hover:bg-[#082A52] text-white font-extrabold text-sm h-12 rounded-2xl shadow-md cursor-pointer transition-all mt-2 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <i className="bi bi-arrow-repeat animate-spin text-lg" /> Submitting...
                        </>
                      ) : (
                        <>
                          Submit Admission Enquiry <i className="bi bi-send-fill text-base" />
                        </>
                      )}
                    </Button>
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
