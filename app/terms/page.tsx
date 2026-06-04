export default function TermsPage() {
  return (
    <div className="container py-12 max-w-4xl mx-auto space-y-8">
      <h1 className="text-4xl font-bold tracking-tight">Terms of Service</h1>
      <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">1. Acceptance of Terms</h2>
          <p>By accessing and using RecallIQ, you accept and agree to be bound by the terms and provision of this agreement.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">2. Educational Use</h2>
          <p>RecallIQ is an educational tool designed to assist with studying. We do not guarantee specific grades, test scores, or academic outcomes as a result of using this service. The AI-generated questions and grading are for practice purposes only and should not replace official course materials.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">4. Acceptable Use</h2>
          <p>You agree not to use the service to generate inappropriate, offensive, or illegal content. We reserve the right to terminate accounts that violate these guidelines.</p>
        </section>
      </div>
    </div>
  )
}
