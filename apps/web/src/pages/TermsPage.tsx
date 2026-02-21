import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function TermsPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Terms of Use</h1>
        <p className="text-lg text-gray-600">Please read these terms carefully before using our platform.</p>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>1. Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          By accessing and using "Made in Middle-East" (the "Platform"), you agree to comply with and be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform.
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>2. Use of the Platform</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          <ul className="list-disc pl-5 space-y-2">
            <li>You must be at least 18 years old to use this Platform.</li>
            <li>You agree to use the Platform only for lawful purposes.</li>
            <li>You are responsible for maintaining the confidentiality of your account information.</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>3. Product Listings and Orders</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          <p>
            The Platform serves as a marketplace connecting suppliers with buyers. We do not own the products listed by independent suppliers.
          </p>
          <p className="mt-2">
            While we strive for accuracy, we do not warrant that product descriptions or other content is accurate, complete, reliable, current, or error-free.
          </p>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>4. Limitation of Liability</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          In no event shall "Made in Middle-East" be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-400 pt-8">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
