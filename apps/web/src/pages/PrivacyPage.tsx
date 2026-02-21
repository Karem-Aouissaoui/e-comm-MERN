import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export function PrivacyPage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900">Privacy Policy</h1>
        <p className="text-lg text-gray-600">How we collect, use, and protect your data.</p>
      </div>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>1. Information We Collect</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          <p>We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with us. This may include:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information (processed securely by third-party providers)</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>2. How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Provide, maintain, and improve our services</li>
            <li>Process transactions and send related information</li>
            <li>Send you technical notices, updates, and support messages</li>
            <li>Respond to your comments and questions</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>3. Data Security</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          We implement appropriate technical and organizational measures to protect the security of your personal information. However, please note that no system is completely secure.
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>4. Contact Us</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-600 leading-relaxed">
          If you have any questions about this Privacy Policy, please contact us at privacy@madeinmiddleeast.com.
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-400 pt-8">
        Last updated: {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
