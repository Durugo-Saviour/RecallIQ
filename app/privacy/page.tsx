export default function PrivacyPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">1. Information We Collect</h2>
          <p>We collect information you provide directly to us when you create an account, such as your email address. We also store the data you generate while using the app, including course names, study topics, and your answers to quiz questions.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">2. How We Use Your Information</h2>
          <p>We use your information solely to provide, maintain, and improve the RecallIQ service. Your study topics and answers are processed by our AI partners (Anthropic) solely for the purpose of generating quizzes and grading your responses. We do not use your study data to train external AI models.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">3. Data Security</h2>
          <p>We implement appropriate technical and organizational measures to protect your personal data against unauthorized or unlawful processing, accidental loss, destruction, or damage. Your data is securely stored using Supabase.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">4. Cookies</h2>
          <p>We use essential cookies to keep you logged in and functional cookies to remember your preferences (like dark mode and cookie consent). We do not use third-party tracking or advertising cookies.</p>
        </section>
      </div>
    </div>
  )
}
