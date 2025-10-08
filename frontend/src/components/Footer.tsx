import { Link } from "react-router-dom";
import { Shield, Github, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const footerSections = [
    {
      title: "Product",
      links: [
        { name: "Features", href: "/how-it-works" },
        { name: "Security", href: "/security" },
        { name: "Pricing", href: "/pricing" },
        { name: "FAQ", href: "/faq" },
      ],
    },
    {
      title: "Tools",
      links: [
        { name: "Password Generator", href: "/tools" },
        { name: "Import/Export", href: "/tools" },
        { name: "Backup Codes", href: "/tools" },
      ],
    },
    {
      title: "Docs",
      links: [
        { name: "Getting Started", href: "/docs" },
        { name: "API Reference", href: "/docs/api" },
        { name: "SDKs", href: "/docs/sdks" },
        { name: "Changelog", href: "/docs/changelog" },
      ],
    },
    {
      title: "Legal",
      links: [
        { name: "Privacy Policy", href: "/privacy" },
        { name: "Terms of Service", href: "/terms" },
        { name: "Security", href: "/security" },
        { name: "Compliance", href: "/compliance" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-card mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-lg font-bold">BioVault</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Your biometric key to password peace.
            </p>
            <div className="flex gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerSections.map((section) => (
            <div key={section.title}>
              <h3 className="font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} BioVault. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              🔒 AES-256 encryption • TLS secured • Local-first architecture
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
