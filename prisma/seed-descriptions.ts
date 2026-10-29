// prisma/seed-descriptions.ts
//
// The long "About the event" text for each seeded event, by slug. Used by
// prisma/seed.ts. Written as HTML because that's what the admin's rich-text
// editor saves — <h2> headings, <p> paragraphs and <ul> lists are styled on
// the event page.

export const EVENT_DESCRIPTIONS: Record<string, string> = {
  // ─── Conference ───────────────────────────────────────────────────
  "narsingdi-business-summit-2026": `
<p>Narsingdi has quietly become one of the busiest manufacturing districts in the country — textiles, dyeing, agro-processing and a growing number of small factories that supply Dhaka and beyond. The <strong>Narsingdi Business Summit</strong> brings the people behind that growth into one room for a full day of honest conversation about what comes next.</p>
<p>This isn't a day of speeches. Each session is short, practical and followed by questions from the floor, and the afternoon is built around meetings you book in advance, so you leave with contacts rather than brochures.</p>

<h2>Who should come</h2>
<ul>
  <li>Factory owners and directors in textiles, garments and agro-processing</li>
  <li>Entrepreneurs running small and medium businesses in the region</li>
  <li>Bankers, investors and SME lenders looking for local opportunities</li>
  <li>Suppliers, logistics partners and exporters who work with Narsingdi firms</li>
</ul>

<h2>The day at a glance</h2>
<ul>
  <li><strong>9:30 AM</strong> — Registration, tea and delegate kits</li>
  <li><strong>10:15 AM</strong> — Opening address: the Narsingdi economy in numbers</li>
  <li><strong>11:00 AM</strong> — Panel: financing growth for small and medium factories</li>
  <li><strong>12:15 PM</strong> — Panel: exports, compliance and what buyers now ask for</li>
  <li><strong>1:15 PM</strong> — Lunch</li>
  <li><strong>2:30 PM</strong> — Pre-booked B2B meetings (Business and VIP passes)</li>
  <li><strong>4:30 PM</strong> — Closing session and vote of thanks</li>
  <li><strong>7:00 PM</strong> — Networking dinner (VIP pass)</li>
</ul>

<h2>What your pass includes</h2>
<p>Every pass includes all sessions, lunch, tea breaks and a delegate kit. The <strong>Business Pass</strong> adds access to the B2B meeting lounge — after you register, our team will send a short form so we can match you with the right people. The <strong>VIP Pass</strong> includes everything above, reserved front-row seating and the evening networking dinner.</p>

<h2>Good to know</h2>
<ul>
  <li>Sessions are in Bangla, with slides in English.</li>
  <li>Bring a few business cards — the meeting lounge moves quickly.</li>
  <li>Free parking is available at the venue; arrive by 9:45 AM to avoid the queue at registration.</li>
  <li>Need an invoice for your company? Reply to your confirmation email and we'll send one.</li>
</ul>`,

  // ─── Marathons ────────────────────────────────────────────────────
  "sundarbans-trail-run": `
<p>There is nowhere else in the world you can run like this. The <strong>Sundarbans Trail Run</strong> follows embankments, mud paths and village roads along the edge of the largest mangrove forest on earth, with river crossings by boat and long stretches where the only sound is your own breathing.</p>
<p>It is not a fast course and it is not meant to be. Expect soft ground after the tide, narrow paths, a few short climbs over embankments and plenty of mud. Most runners finish slower than their road times — and say it was the best race they've done.</p>

<h2>Choose your distance</h2>
<ul>
  <li><strong>10K Trail Explorer</strong> — a single loop through the villages and along the river. A good first trail race.</li>
  <li><strong>21K Trail Warrior</strong> — two loops, including the longer embankment section.</li>
  <li><strong>42K Ultra Trail</strong> — the full course, for experienced trail runners only. Places are deliberately limited.</li>
</ul>

<h2>Race weekend</h2>
<ul>
  <li><strong>Day before</strong> — Kit collection in Mongla, 3:00–7:00 PM, followed by the race briefing</li>
  <li><strong>Race day, 4:30 AM</strong> — Boat transfer from Mongla to the start area</li>
  <li><strong>5:30 AM</strong> — Start for all distances (staggered by five minutes)</li>
  <li><strong>11:30 AM</strong> — Course closes; lunch and medals at the finish</li>
</ul>

<h2>Included with your entry</h2>
<ul>
  <li>Return boat transfer from Mongla</li>
  <li>Race bib with timing chip, finisher medal and race T-shirt</li>
  <li>Water and electrolyte stations every 4–5 km</li>
  <li>Medical team and forest guides along the course</li>
  <li>Lunch at the finish</li>
</ul>

<h2>Before you sign up</h2>
<ul>
  <li>Trail shoes are strongly recommended. Road shoes struggle in the mud.</li>
  <li>The 42K has a 6-hour cut-off at the halfway point — please be honest about your fitness.</li>
  <li>The Forest Department sets the rules inside the reserve; marshals will ask you to stay on the marked path.</li>
  <li>Accommodation in Mongla is limited on race weekend. Book early.</li>
</ul>`,

  "chattogram-coastal-run": `
<p>Watch the sun come up over the Bay of Bengal while you run. The <strong>Chattogram Coastal Run</strong> starts on Patenga Beach and follows the marine drive along the water — flat, wide, closed to traffic and cooled by the sea breeze. If you've been chasing a personal best, this is the course for it.</p>

<h2>Distances</h2>
<ul>
  <li><strong>5K Beach Run</strong> — out and back along the seafront. Families and first-timers welcome.</li>
  <li><strong>10K Coastal</strong> — a longer stretch of the marine drive, with the turn near the airport road.</li>
  <li><strong>21K Coastal Half</strong> — the full marine drive and back. Fast, flat and popular with returning runners.</li>
</ul>

<h2>Race morning</h2>
<ul>
  <li><strong>5:00 AM</strong> — Start area opens on Patenga Beach; bag drop and warm-up</li>
  <li><strong>6:00 AM</strong> — Half marathon start</li>
  <li><strong>6:20 AM</strong> — 10K start</li>
  <li><strong>6:30 AM</strong> — 5K start</li>
  <li><strong>9:30 AM</strong> — Prize giving and beach breakfast</li>
</ul>

<h2>Included with your entry</h2>
<ul>
  <li>Timed bib, finisher medal and race T-shirt</li>
  <li>Water stations every 2.5 km and a recovery drink at the finish</li>
  <li>Bag drop and changing tents</li>
  <li>Breakfast on the beach after the race</li>
</ul>

<h2>Getting there</h2>
<p>The start is on the main Patenga Beach promenade. Roads around the course close at 5:30 AM, so plan to arrive early — ride-sharing drop-off is available at the airport road junction, a five-minute walk from the start.</p>`,

  "victory-day-virtual-run": `
<p>On 16 December the whole country celebrates. This year, mark Victory Day by running your own distance — around your neighbourhood, along the river, on a treadmill or with friends in the park. Wherever you are in Bangladesh, you run, you log it, and we send the medal to your door.</p>

<h2>How it works</h2>
<ul>
  <li><strong>Register</strong> and choose your distance: 5K, 10K or 21K.</li>
  <li><strong>Run on 16 December</strong>, any time from midnight to midnight, anywhere you like.</li>
  <li><strong>Track it</strong> with any GPS app — Strava, Nike Run Club, Garmin, your phone's health app — or a treadmill photo.</li>
  <li><strong>Submit your result</strong> from your dashboard on this site by 20 December.</li>
  <li><strong>Get your medal</strong> — finisher medals are couriered to the address on your registration within two weeks.</li>
</ul>

<h2>Why run it</h2>
<p>Families run together, office teams enter as groups and friends in different cities run "together" on the same morning. It's not a race against anyone else — just a way to spend Victory Day doing something good for yourself.</p>

<h2>Good to know</h2>
<ul>
  <li>Walking is welcome. There is no time limit.</li>
  <li>You can split your distance into two runs on the day if you need to.</li>
  <li>Running as a team? Use the same community name when you register and you'll appear together on the results list.</li>
  <li>Please double-check your delivery address when registering — medals sent to an old address can't be re-sent.</li>
</ul>`,

  "old-dhaka-heritage-run": `
<p>Old Dhaka is at its most beautiful just after dawn, before the rickshaws and the traffic, when the light hits the pink walls of Ahsan Manzil and the streets are almost empty. The <strong>Old Dhaka Heritage Run</strong> takes you through four hundred years of the city's history in a single morning.</p>

<h2>The course</h2>
<p>Both routes start and finish at Ahsan Manzil on the Buriganga riverfront. The 5K heads through the old lanes to the Star Mosque and back; the 10K continues on to Lalbagh Fort before returning along the river. Marshals and volunteers are at every turn — the lanes are narrow and the course is fully marked.</p>
<ul>
  <li><strong>5K Heritage Walk</strong> — walk or jog; guides share the story of each landmark along the way</li>
  <li><strong>10K Lalbagh</strong> — a timed run past Ahsan Manzil, the Star Mosque and Lalbagh Fort</li>
</ul>

<h2>Race morning</h2>
<ul>
  <li><strong>4:45 AM</strong> — Start area opens at Ahsan Manzil</li>
  <li><strong>5:30 AM</strong> — 10K start</li>
  <li><strong>5:45 AM</strong> — 5K Heritage Walk start</li>
  <li><strong>8:00 AM</strong> — Breakfast in the Ahsan Manzil grounds and medal photos</li>
</ul>

<h2>Included</h2>
<ul>
  <li>Bib, finisher medal and heritage-edition T-shirt</li>
  <li>Water stations and a traditional breakfast at the finish</li>
  <li>Free entry to the Ahsan Manzil museum after the run</li>
</ul>`,

  // ─── Exhibition ───────────────────────────────────────────────────
  "bangladesh-trade-expo-2026": `
<p>Three halls, two days and more than two hundred exhibitors. The <strong>Bangladesh Trade Expo</strong> is where manufacturers, exporters and buyers meet face to face — to see the product, ask the hard questions and agree terms on the spot.</p>

<h2>What's in the halls</h2>
<ul>
  <li><strong>Hall 1 — Textiles &amp; apparel:</strong> fabrics, trims, accessories and finished garments</li>
  <li><strong>Hall 2 — Food, agro &amp; packaging:</strong> processed foods, spices, packaging and labelling</li>
  <li><strong>Hall 3 — Technology &amp; services:</strong> machinery, software, logistics and finance</li>
</ul>

<h2>Buyer–seller meetings</h2>
<p>With a <strong>Trade Buyer Pass</strong> you can book up to eight 20-minute meetings with exhibitors over the two days. A week before the expo we'll email the exhibitor list so you can choose who you want to meet; our team arranges the schedule and sends it to you the day before.</p>

<h2>Opening hours</h2>
<ul>
  <li><strong>Both days:</strong> 10:00 AM – 7:00 PM</li>
  <li><strong>Day 1, 10:00 AM – 12:00 PM:</strong> trade visitors only</li>
  <li><strong>Day 2, 3:00 PM:</strong> seminar — "Selling to large retailers: what buyers look for"</li>
</ul>

<h2>Good to know</h2>
<ul>
  <li>Bring your registration QR code (in your confirmation email) for fast entry.</li>
  <li>Visitor passes are valid for one day; the Trade Buyer Pass covers both days.</li>
  <li>There's a food court in the lobby and prayer rooms on every floor.</li>
  <li>Want to exhibit rather than visit? Contact us — a few stands are still available.</li>
</ul>`,

  // ─── Social ───────────────────────────────────────────────────────
  "venus-corporate-gala-night": `
<p>Once a year we set the planning aside and say thank you. The <strong>Venus Corporate Gala Night</strong> is an evening for the clients, venues, suppliers and friends who made this year's events happen — a relaxed dinner, good music and the partner awards, in the garden ballroom at Radisson Blu.</p>

<h2>The evening</h2>
<ul>
  <li><strong>7:00 PM</strong> — Welcome drinks on the terrace</li>
  <li><strong>7:45 PM</strong> — Guests seated; a short welcome from our managing director</li>
  <li><strong>8:00 PM</strong> — Three-course dinner</li>
  <li><strong>9:15 PM</strong> — The Venus partner awards</li>
  <li><strong>9:45 PM</strong> — Live band until late</li>
</ul>

<h2>Dinner</h2>
<p>Choose chicken, beef, fish or vegetarian when you book — you'll find the question at checkout. Please tell us about any allergies in the message box and the kitchen will look after you. All food served is halal.</p>

<h2>Dress code</h2>
<p>Black tie optional. Many guests wear traditional formal wear — sherwani, panjabi or saree are all very welcome.</p>

<h2>Good to know</h2>
<ul>
  <li>The <strong>Couple</strong> ticket seats two guests together; the name on the booking is the lead guest.</li>
  <li>Booking for a whole team? Book single seats under one company name and we'll seat you together.</li>
  <li>Valet parking is available at the hotel entrance.</li>
</ul>`,

  // ─── Workshop ─────────────────────────────────────────────────────
  "event-planning-masterclass": `
<p>Planning an event looks simple until you're doing it. This live, two-hour masterclass walks you through how our team actually plans events — from the first budget conversation to the moment the last guest leaves — with the templates and checklists we use every day.</p>

<h2>What you'll learn</h2>
<ul>
  <li><strong>Budgeting</strong> — how to build a realistic budget and where events usually overspend</li>
  <li><strong>Venues and vendors</strong> — what to ask before you sign, and how to compare quotes fairly</li>
  <li><strong>Timelines</strong> — working backwards from the event day, and the deadlines that matter</li>
  <li><strong>Run-of-show</strong> — writing a minute-by-minute plan your whole team can follow</li>
  <li><strong>On the day</strong> — handling late suppliers, weather and the things nobody planned for</li>
</ul>

<h2>Who it's for</h2>
<p>HR and admin teams who organise company events, new event planners, wedding planners growing their business, and anyone who has been handed "the office party" this year. No experience needed.</p>

<h2>How it works</h2>
<ul>
  <li>Live on Zoom — the joining link arrives by email the day before</li>
  <li>Two hours, with a short break and plenty of time for questions</li>
  <li>A recording is shared with everyone who registers, for 30 days</li>
  <li><strong>Plus</strong> ticket holders also get our planning toolkit: budget template, vendor checklist and run-of-show template</li>
</ul>`,
};
