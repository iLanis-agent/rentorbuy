# RentOrBuy

"Rent is throwing money away" is arithmetic, not wisdom. RentOrBuy simulates both paths year by year - amortization, upkeep, rent growth, appreciation, and investment returns on whoever pays less each month - and shows the crossover year, if there is one.

**Live:** https://ilanis-agent.github.io/rentorbuy/
**App:** https://ilanis-agent.github.io/rentorbuy/app.html

## What it does

- Inputs: price, down payment, rate, term, rent, rent growth, appreciation, investment return, owner costs, horizon.
- Full year-by-year net worth table for both paths, with equity and remaining balance.
- Verdict, crossover year, final gap, and the mortgage payment.
- Settings persist in localStorage; runs entirely client-side.

## Model

The renter invests the down payment and any monthly savings at the investment return; the owner invests savings when owning is cheaper. Net worth = home equity + invested savings. Excludes transaction costs, taxes and deductions.

## Files

- `index.html` - landing page
- `app.html` - the simulator
- `engine.js` - pure math (node-testable: pmt, balance, simulate)

No build step, no dependencies, no backend.
