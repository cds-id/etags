import Link from 'next/link';
import {
  ArrowRight,
  BarChart3,
  Box,
  CheckCircle2,
  ChevronRight,
  Globe,
  Layers,
  Lock,
  Scan,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-stone-50 font-sans selection:bg-indigo-100 selection:text-indigo-900 overflow-hidden">
      {/* Ambient Background Effects (Bokeh / Depth) */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw] rounded-full bg-indigo-100/40 blur-[100px] mix-blend-multiply opacity-70" />
        <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] rounded-full bg-rose-50/60 blur-[100px] mix-blend-multiply opacity-70" />
        <div className="absolute bottom-[-10%] left-[20%] w-[60vw] h-[40vw] rounded-full bg-teal-50/50 blur-[100px] mix-blend-multiply opacity-70" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-stone-200/60 bg-stone-50/80 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-white shadow-sm ring-1 ring-stone-900/5">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-stone-900">
              Etags
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600">
              <Link
                href="/explorer"
                className="hover:text-stone-900 transition-colors"
              >
                Explorer
              </Link>
              <Link
                href="/scan"
                className="hover:text-stone-900 transition-colors"
              >
                Scanner
              </Link>
              <Link
                href="/docs"
                className="hover:text-stone-900 transition-colors"
              >
                Developers
              </Link>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                asChild
                size="sm"
                className="hidden sm:flex text-stone-600 hover:text-stone-900 hover:bg-stone-100"
              >
                <Link href="/login">Log in</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-stone-900 text-stone-50 hover:bg-stone-800 shadow-sm"
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center rounded-full border border-stone-200 bg-white/50 px-3 py-1 text-sm text-stone-600 backdrop-blur-sm mb-8 shadow-sm">
            <Sparkles className="mr-2 h-3.5 w-3.5 text-indigo-500" />
            <span className="font-medium">
              Now supporting Base Sepolia Testnet
            </span>
          </div>

          <h1 className="mb-6 text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-stone-900 leading-[1.1]">
            Authenticity, <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-stone-600">
              Simplified.
            </span>
          </h1>

          <p className="mx-auto mb-10 max-w-xl text-lg text-stone-600 leading-relaxed">
            A seamless blockchain layer for your product lifecycle. Protect your
            brand integrity and give your customers the transparency they
            deserve, without the complexity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              asChild
              className="w-full sm:w-auto h-12 px-8 bg-stone-900 text-white hover:bg-stone-800 shadow-md rounded-full text-base"
            >
              <Link href="/register">Start Integration</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full sm:w-auto h-12 px-8 border-stone-200 bg-white/50 hover:bg-white text-stone-700 hover:text-stone-900 rounded-full text-base backdrop-blur-sm"
            >
              <Link href="/scan">
                <Scan className="mr-2 h-4 w-4" />
                Try Scanner
              </Link>
            </Button>
          </div>

          {/* Trusted By Strip */}
          <div className="border-t border-stone-200/60 pt-10">
            <p className="text-sm font-medium text-stone-500 mb-6">
              TRUSTED BY INNOVATIVE TEAMS
            </p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos - using text for now but styled to look like logos */}
              <span className="text-xl font-bold text-stone-800">
                Acme Corp
              </span>
              <span className="text-xl font-serif italic text-stone-800">
                LuxeLabel
              </span>
              <span className="text-xl font-mono text-stone-800">
                BLOCKCHAIN.IO
              </span>
              <span className="text-xl font-black text-stone-800">
                Vanguard
              </span>
              <span className="text-xl font-light tracking-widest text-stone-800">
                PURE
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Deep Dive */}
      <section className="relative z-10 py-20 sm:py-32 space-y-24 sm:space-y-32">
        {/* Feature 1: Analytics */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-indigo-100/50 rounded-3xl transform rotate-3 scale-95 blur-xl" />
              <div className="relative bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden p-2">
                <div className="bg-stone-50 rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-stone-100">
                  <BarChart3 className="w-24 h-24 text-indigo-200" />
                  {/* Abstract UI representation */}
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center rounded-full bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-600 mb-6">
                <Zap className="mr-2 h-4 w-4" />
                Real-time Insights
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
                Data-driven decisions for your supply chain.
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Gain visibility into where your products are being scanned.
                Detect gray market activity and potential counterfeiting
                hotspots in real-time with our advanced dashboard.
              </p>
              <ul className="space-y-4">
                {[
                  'Geospatial scan tracking',
                  'Counterfeit attempt alerts',
                  'Supply chain velocity metrics',
                ].map((item, i) => (
                  <li key={i} className="flex items-center text-stone-700">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 mr-3" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Feature 2: Consumer Experience */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-teal-50 px-3 py-1 text-sm font-medium text-teal-600 mb-6">
                <Smartphone className="mr-2 h-4 w-4" />
                Seamless Experience
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
                No app required. Just point and scan.
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Remove friction from the verification process. Our web-native
                scanner works directly in the browser, ensuring high adoption
                rates among your customers.
              </p>
              <Button
                variant="link"
                className="p-0 h-auto text-teal-600 font-semibold text-lg hover:text-teal-700"
              >
                See the demo <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-teal-100/50 rounded-3xl transform -rotate-3 scale-95 blur-xl" />
              <div className="relative bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden p-2">
                <div className="bg-stone-50 rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-stone-100">
                  <Scan className="w-24 h-24 text-teal-200" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Security */}
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="absolute inset-0 bg-rose-100/50 rounded-3xl transform rotate-2 scale-95 blur-xl" />
              <div className="relative bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden p-2">
                <div className="bg-stone-50 rounded-xl p-6 h-[300px] sm:h-[400px] flex items-center justify-center border border-stone-100">
                  <ShieldCheck className="w-24 h-24 text-rose-200" />
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-600 mb-6">
                <Lock className="mr-2 h-4 w-4" />
                Bank-grade Security
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-900 mb-6">
                Immutable records on Base Sepolia.
              </h2>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                Every product tag is minted as a digital asset on the
                blockchain. This creates a permanent, tamper-proof record of
                provenance that cannot be forged.
              </p>
              <div className="flex gap-4">
                <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-stone-900 mb-1">
                    99.9%
                  </div>
                  <div className="text-sm text-stone-500">Uptime</div>
                </div>
                <div className="bg-white border border-stone-200 rounded-lg p-4 shadow-sm">
                  <div className="text-2xl font-bold text-stone-900 mb-1">
                    &lt;1s
                  </div>
                  <div className="text-sm text-stone-500">
                    Verification Time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries / Use Cases */}
      <section className="relative z-10 py-20 bg-stone-100/50 border-y border-stone-200">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              Tailored for your industry
            </h2>
            <p className="text-stone-600">
              Etags adapts to the unique needs of different product categories.
            </p>
          </div>

          <Tabs defaultValue="fashion" className="w-full max-w-4xl mx-auto">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-white/50 backdrop-blur-sm border border-stone-200 p-1 rounded-full">
                <TabsTrigger
                  value="fashion"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-stone-900 data-[state=active]:text-white"
                >
                  Fashion
                </TabsTrigger>
                <TabsTrigger
                  value="electronics"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-stone-900 data-[state=active]:text-white"
                >
                  Electronics
                </TabsTrigger>
                <TabsTrigger
                  value="pharma"
                  className="rounded-full px-6 py-2 data-[state=active]:bg-stone-900 data-[state=active]:text-white"
                >
                  Pharma
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="fashion" className="mt-0">
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">
                    Protect Limited Editions
                  </h3>
                  <p className="text-stone-600 mb-6">
                    Verify authenticity of luxury goods and limited drops.
                    Enable digital ownership transfer for resale markets.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      Digital Certificates of Authenticity
                    </li>
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      Resale Royalty Tracking
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-stone-100 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-16 h-16 text-stone-300" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="electronics" className="mt-0">
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">
                    Warranty & Registration
                  </h3>
                  <p className="text-stone-600 mb-6">
                    Simplify warranty registration with a single scan. Track
                    component provenance and repair history.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      One-tap Warranty Activation
                    </li>
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      Supply Chain Transparency
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-stone-100 rounded-xl flex items-center justify-center">
                  <Zap className="w-16 h-16 text-stone-300" />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="pharma" className="mt-0">
              <div className="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-stone-900 mb-4">
                    Patient Safety First
                  </h3>
                  <p className="text-stone-600 mb-6">
                    Combat counterfeit medicines. Allow patients to verify
                    expiration dates and batch numbers instantly.
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      Batch Tracking
                    </li>
                    <li className="flex items-center text-sm text-stone-700">
                      <CheckCircle2 className="w-4 h-4 text-stone-900 mr-2" />{' '}
                      Regulatory Compliance
                    </li>
                  </ul>
                </div>
                <div className="w-full md:w-1/3 aspect-square bg-stone-100 rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-16 h-16 text-stone-300" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative z-10 py-20 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-stone-900 mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'Do I need crypto to use Etags?',
                a: 'No. We abstract away all blockchain complexity. You pay in fiat, we handle the gas fees and wallet management.',
              },
              {
                q: 'Can the QR codes be copied?',
                a: 'While physical copying is possible, our system detects duplicate scans and anomalies in location/time, flagging potential counterfeits immediately.',
              },
              {
                q: 'How long does integration take?',
                a: 'You can start manually tagging products in minutes. API integration for automated manufacturing lines typically takes 1-2 weeks.',
              },
              {
                q: 'Is my data public?',
                a: 'Only the verification hash is public. Your sensitive business intelligence and supply chain data remains private and encrypted.',
              },
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-bold text-stone-900 mb-2">{item.q}</h3>
                <p className="text-stone-600 text-sm leading-relaxed">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 sm:py-32">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-stone-900 px-6 py-16 sm:px-16 sm:py-24 text-center shadow-2xl">
            {/* Abstract shapes in CTA */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
              <div className="absolute top-[-50%] left-[-20%] w-[80%] h-[80%] rounded-full bg-indigo-500 blur-3xl" />
              <div className="absolute bottom-[-50%] right-[-20%] w-[80%] h-[80%] rounded-full bg-teal-500 blur-3xl" />
            </div>

            <div className="relative z-10 max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 tracking-tight">
                Ready to modernize your product verification?
              </h2>
              <p className="text-stone-300 mb-10 text-lg">
                Join forward-thinking brands using Etags to secure their revenue
                and build lasting customer trust.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button
                  size="lg"
                  asChild
                  className="w-full sm:w-auto bg-white text-stone-900 hover:bg-stone-100 h-12 px-8 rounded-full font-medium"
                >
                  <Link href="/register">Create Account</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="w-full sm:w-auto border-stone-700 text-stone-300 hover:text-white hover:bg-stone-800 hover:border-stone-600 h-12 px-8 rounded-full bg-transparent"
                >
                  <Link href="/docs">Read Documentation</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-stone-200 bg-white/50 backdrop-blur-sm pt-16 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-6 w-6 rounded bg-stone-900 text-white flex items-center justify-center">
                  <Layers className="h-3 w-3" />
                </div>
                <span className="text-lg font-bold text-stone-900">Etags</span>
              </div>
              <p className="text-stone-500 text-sm max-w-xs mb-6">
                The standard for blockchain-based product verification. Secure,
                scalable, and simple.
              </p>
              <div className="flex gap-4">
                {/* Social placeholders */}
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition-colors cursor-pointer">
                  <Box className="w-4 h-4" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <Link href="/features" className="hover:text-stone-900">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-stone-900">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/docs" className="hover:text-stone-900">
                    API
                  </Link>
                </li>
                <li>
                  <Link href="/showcase" className="hover:text-stone-900">
                    Showcase
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <Link href="/about" className="hover:text-stone-900">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="hover:text-stone-900">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-stone-900">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-stone-900">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-stone-900 mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-stone-600">
                <li>
                  <Link href="/privacy" className="hover:text-stone-900">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-stone-900">
                    Terms
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="hover:text-stone-900">
                    Security
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-200 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-stone-500">
              &copy; {new Date().getFullYear()} Etags Inc. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Systems Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
