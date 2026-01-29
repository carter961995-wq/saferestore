import { Link } from "react-router-dom";

const plans = [
  {
    title: "One-Time Recovery Session",
    price: "$39",
    bullets: [
      "Guided intake and recovery plan",
      "Step-by-step official recovery guidance",
      "Concierge chat (basic)",
    ],
    button: "Start Recovery",
  },
  {
    title: "Priority Concierge",
    price: "$79",
    bullets: [
      "Everything in One-Time Recovery Session",
      "Priority concierge chat guidance",
      "Case summary you can save and share",
    ],
    button: "Get Priority Help",
  },
  {
    title: "SafeRestore Plus",
    price: "$12 / month",
    bullets: [
      "Unlimited recovery plans",
      "Backup readiness checks",
      "Ongoing guidance when you upgrade devices",
    ],
    button: "Start Plus",
  },
];

export default function Pricing() {
  return (
    <section className="space-y-8">
      <div className="space-y-3">
        <h1 className="text-3xl font-semibold text-slate">Pricing</h1>
        <p className="text-base leading-relaxed text-slate-600">
          Choose the level of guidance you need. SafeRestore is official-path
          only — no security bypasses, no guesswork.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.title}
            className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-base font-semibold text-slate">{plan.title}</h2>
            <p className="mt-3 text-2xl font-semibold text-slate">
              {plan.price}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {plan.bullets.map((bullet) => (
                <li key={bullet} className="list-disc pl-4">
                  {bullet}
                </li>
              ))}
            </ul>
            <Link
              to="/recovery"
              className="mt-6 inline-flex items-center justify-center rounded-full bg-ocean px-5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {plan.button}
            </Link>
          </div>
        ))}
      </div>

      <div className="text-sm text-slate-500">
        No bypasses. No pressure. Just the safest official path forward.
      </div>
    </section>
  );
}
