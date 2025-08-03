import { SettingsInterface } from "@/components/ui/settings";
import { Breadcrumb } from "@/components/ui/accessible-navigation";
import { motion } from "framer-motion";

export default function SettingsPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Settings" }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background"
      id="main-content"
    >
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        <SettingsInterface />
      </div>
    </motion.div>
  );
}