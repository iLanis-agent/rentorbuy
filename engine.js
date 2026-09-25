/* RentOrBuy engine - rent-vs-buy net worth simulation. */
const RentBuyEngine = (() => {
  'use strict';

  function pmt(principal, annualRate, years) {
    const n = years * 12;
    const i = annualRate / 12;
    if (i === 0) return principal / n;
    return principal * i / (1 - Math.pow(1 + i, -n));
  }

  function balance(principal, annualRate, years, monthsElapsed) {
    const n = years * 12;
    const k = Math.min(monthsElapsed, n);
    const i = annualRate / 12;
    const p = pmt(principal, annualRate, years);
    if (i === 0) return Math.max(0, principal - p * k);
    return Math.max(0, principal * Math.pow(1 + i, k) - p * (Math.pow(1 + i, k) - 1) / i);
  }

  function norm(opts) {
    const num = (v, label, lo, hi) => {
      const n = Number(v);
      if (!Number.isFinite(n) || n < lo || n > hi) throw new Error(label + ' must be ' + lo + '-' + hi);
      return n;
    };
    const o = {
      homePrice: num(opts.homePrice, 'home price', 1000, 100000000),
      downPct: num(opts.downPct, 'down payment %', 0, 100) / 100,
      rate: num(opts.rate, 'mortgage rate %', 0, 30) / 100,
      years: Math.round(num(opts.years, 'mortgage years', 1, 40)),
      rent: num(opts.rent, 'monthly rent', 0, 1000000),
      rentGrowth: num(opts.rentGrowth, 'rent growth %', -10, 30) / 100,
      appreciation: num(opts.appreciation, 'home appreciation %', -20, 30) / 100,
      investReturn: num(opts.investReturn, 'investment return %', -10, 30) / 100,
      upkeepPct: num(opts.upkeepPct, 'owner costs % of value/yr', 0, 20) / 100,
      horizonYears: Math.round(num(opts.horizonYears, 'horizon', 1, 40))
    };
    if (o.horizonYears > o.years) o.years = o.horizonYears; // keep amortization defined across horizon
    return o;
  }

  /*
   * Monthly cash flows: owner pays mortgage + upkeep; renter pays rent (grows annually).
   * Whoever pays less per month invests the difference at investReturn (monthly comp).
   * The renter also invests the down payment up front.
   * Net worth: buy = home equity + invested savings; rent = invested savings (incl. down payment).
   */
  function simulate(rawOpts) {
    const o = norm(rawOpts);
    const down = o.homePrice * o.downPct;
    const principal = o.homePrice - down;
    const monthly = pmt(principal, o.rate, o.years);
    const mi = o.investReturn / 12;
    let buyInv = 0, rentInv = down;
    const rows = [];
    let crossover = null;
    for (let y = 1; y <= o.horizonYears; y++) {
      for (let m = 1; m <= 12; m++) {
        const monthsSoFar = (y - 1) * 12 + m;
        const homeValueNow = o.homePrice * Math.pow(1 + o.appreciation, (monthsSoFar - 1) / 12);
        const ownerCost = monthly + homeValueNow * o.upkeepPct / 12;
        const rentCost = o.rent * Math.pow(1 + o.rentGrowth, y - 1);
        buyInv *= (1 + mi);
        rentInv *= (1 + mi);
        if (ownerCost >= rentCost) rentInv += ownerCost - rentCost;
        else buyInv += rentCost - ownerCost;
      }
      const homeValue = o.homePrice * Math.pow(1 + o.appreciation, y);
      const bal = balance(principal, o.rate, o.years, y * 12);
      const buyNW = (homeValue - bal) + buyInv;
      const rentNW = rentInv;
      rows.push({ year: y, buyNW: buyNW, rentNW: rentNW, equity: homeValue - bal, homeValue: homeValue, balance: bal });
      if (crossover === null && buyNW >= rentNW) crossover = y;
    }
    const last = rows[rows.length - 1];
    return {
      rows: rows,
      crossover: crossover,
      finalBuy: last.buyNW,
      finalRent: last.rentNW,
      monthlyPmt: monthly,
      downPayment: down,
      principal: principal,
      winner: last.buyNW >= last.rentNW ? 'buy' : 'rent'
    };
  }

  return { pmt, balance, norm, simulate };
})();
if (typeof module !== 'undefined') module.exports = RentBuyEngine;
