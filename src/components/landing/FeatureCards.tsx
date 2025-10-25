import { motion } from "framer-motion";
import { Calendar, FileCheck, Lock } from "lucide-react";

const features = [
  {
    title: "Never miss a deadline",
    description:
      "Doc monitors all your documents and proactively notifies you about upcoming deadlines, with clear action steps to stay on track.",
    icon: Calendar,
    align: "left" as const,
  },
  {
    title: "Fill once, apply everywhere",
    description:
      "Store your information securely once, and Doc automatically fills forms across multiple applications, saving you hours of repetitive work.",
    icon: FileCheck,
    align: "right" as const,
  },
  {
    title: "Your secure document vault",
    description:
      "All your important documents organized in one place, with bank-grade encryption and intelligent search to find exactly what you need instantly.",
    icon: Lock,
    align: "left" as const,
  },
];

export const FeatureCards = () => {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-16">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, x: feature.align === "left" ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className={`flex flex-col md:flex-row gap-8 items-center ${
              feature.align === "right" ? "md:flex-row-reverse" : ""
            }`}
          >
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-3xl font-bold">{feature.title}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>

            <div className="flex-1 bg-surface border border-border rounded-xl p-8 h-64 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <feature.icon className="h-20 w-20 mx-auto mb-4 opacity-20" />
                <p className="text-sm">Interactive animation preview</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
