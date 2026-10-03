// Fake season data for the UI kit demo.

window.FAKE_DRIVERS = [
    { id: 1, name: "Max Verstappen", team: "Red Bull",       number: 1 },
    { id: 4, name: "Lando Norris",   team: "McLaren",        number: 4 },
    { id: 16, name: "Charles Leclerc",team: "Ferrari",        number: 16 },
    { id: 81, name: "Oscar Piastri", team: "McLaren",        number: 81 },
    { id: 44, name: "Lewis Hamilton",team: "Ferrari",        number: 44 },
    { id: 63, name: "George Russell",team: "Mercedes",       number: 63 },
    { id: 11, name: "Sergio Perez",  team: "Red Bull",       number: 11 },
    { id: 55, name: "Carlos Sainz",  team: "Williams",       number: 55 },
];

window.FAKE_MEMBERS = [
    { id: 1, name: "Ole H.",   points: 142, stars: 3, bets: 14 },
    { id: 2, name: "Bjarne K.",points: 128, stars: 1, bets: 14 },
    { id: 3, name: "Søren D.", points: 117, stars: 0, bets: 13 },
    { id: 4, name: "Henrik J.",points:  98, stars: 1, bets: 12 },
    { id: 5, name: "Per M.",   points:  87, stars: 0, bets: 14 },
];

window.FAKE_RACES = [
    {
        id: 1,
        name: "Monaco Grand Prix",
        location: "Monte Carlo",
        date: "24 May 2026",
        time: "15:00",
        status: "open",   // open | pending | closed | completed
        pool: 250,
        bets: 8,
        countdown: "11h 24m",
        qualifying: null,
        result: null,
    },
    {
        id: 2,
        name: "Spanish Grand Prix",
        location: "Barcelona",
        date: "07 Jun 2026",
        time: "15:00",
        status: "pending",
        pool: null,
        bets: 0,
        countdown: "12d 02h",
        qualifying: null,
        result: null,
    },
    {
        id: 3,
        name: "Emilia Romagna GP",
        location: "Imola",
        date: "17 May 2026",
        time: "15:00",
        status: "completed",
        pool: 200,
        bets: 9,
        countdown: null,
        qualifying: [1, 4, 16],
        result: [4, 1, 16],
    },
];

window.FAKE_USER = {
    id: 1,
    name: "Ole H.",
    initial: "O",
    stars: 3,
    inCompetition: true,
};

window.LANG = {
    da: {
        home: "Hjem", races: "Løb", leaderboard: "Rangliste", rules: "Regler", profile: "Profil",
        login: "Log ind", logout: "Log ud", year: "2026",
        hero_title: "Velkommen til F1 Klubben",
        hero_text: "Placér dit bet før løbet starter. Én bet per løb, point for korrekt top-3 — en stjerne hvis du rammer plet.",
        upcoming: "Kommende Løb", upcoming_none: "Ingen kommende løb",
        place_bet: "Placer Bet", edit: "Rediger", all_bets: "Alle Bets",
        bets_open: "Betting Åben", bets_pending: "Pending", bets_closed: "Betting Lukket", bets_done: "Løb Afsluttet",
        opens_in: "Betting åbner om", closes_in: "Betting lukker om",
        pool: "Puljestørrelse:", bets_count: "bets", qualifying: "Kvalifikation", result: "Resultat",
        leaderboard_full: "Se hele ranglisten", bets_label: "bets", you: "DIG",
        email: "E-mail", password: "Adgangskode", forgot: "Glemt adgangskode?",
        modal_select: "Vælg dine top 3", cancel: "Annuller", save: "Gem bet",
        contact: "Kontakt:",
        rules_title: "Klubregler",
        rules_intro: "Frederikssund F1 Klub kører efter de samme regler hver sæson. Læs dem grundigt — de er forpligtende, når du logger ind og placerer et bet.",
        rules_updated: "Sidst opdateret 12. marts 2026",
        rules_print: "Print regler", rules_download: "Hent som PDF",
    },
    en: {
        home: "Home", races: "Races", leaderboard: "Leaderboard", rules: "Rules", profile: "Profile",
        login: "Login", logout: "Logout", year: "2026",
        hero_title: "Welcome to the F1 Club",
        hero_text: "Place your bet before the race starts. One bet per race, points for a correct top-3 — a star if you nail it.",
        upcoming: "Upcoming Races", upcoming_none: "No upcoming races",
        place_bet: "Place Bet", edit: "Edit", all_bets: "All bets",
        bets_open: "Betting Open", bets_pending: "Pending", bets_closed: "Betting Closed", bets_done: "Race Completed",
        opens_in: "Betting opens in", closes_in: "Betting closes in",
        pool: "Pool size:", bets_count: "bets", qualifying: "Qualifying", result: "Result",
        leaderboard_full: "View full leaderboard", bets_label: "bets", you: "YOU",
        email: "Email", password: "Password", forgot: "Forgot password?",
        modal_select: "Pick your top 3", cancel: "Cancel", save: "Save bet",
        contact: "Contact:",
        rules_title: "Club rules",
        rules_intro: "Frederikssund F1 Klub runs the same rules every season. Read them carefully — they're binding the moment you log in and place a bet.",
        rules_updated: "Last updated 12 March 2026",
        rules_print: "Print rules", rules_download: "Download PDF",
    },
};

window.FAKE_RULES = {
    da: [
        {
            id: "betting", icon: "stopwatch", title: "Bets & deadlines",
            items: [
                ["1.1", "Ét bet per medlem per løb. Du må redigere så længe betting er åben."],
                ["1.2", "Betting åbner søndag aften efter forrige løb og lukker præcis 1 minut før lights out."],
                ["1.3", "Et bet består af din top 3 — P1, P2, P3 — i den rækkefølge du tror, de krydser målstregen."],
                ["1.4", "Du må ikke vælge den samme kører to gange i samme bet."],
                ["1.5", "Glemmer du at placere et bet, får du 0 point for det løb. Ingen efter-spil."],
            ],
        },
        {
            id: "points", icon: "calculator", title: "Pointsystem",
            items: [
                ["2.1", "P1 korrekt giver 10 point. P2 korrekt giver 6. P3 korrekt giver 3."],
                ["2.2", "Rammer du en kører i den forkerte top-3 position, får du 1 point i trøstpoint."],
                ["2.3", "Rammer du alle tre i præcis rigtig rækkefølge tildeles du en stjerne ★ — synlig på din profil resten af sæsonen."],
                ["2.4", "Sprint-løb tæller halve point. Sprint-shootout tæller ikke."],
                ["2.5", "DSQ efter race (udelukkelse) opdaterer resultatet og dermed pointene — også bagudrettet."],
            ],
        },
        {
            id: "pool", icon: "coins", title: "Puljen",
            items: [
                ["3.1", "Sæsonens pulje er frivillig. Indskud er 200 kr og betales til kassereren senest 15. marts."],
                ["3.2", "Puljen udbetales til top 3 i sæsonens samlede rangliste: 60% / 30% / 10%."],
                ["3.3", "Ved pointlighed deler de medlemmer prisen ligeligt. Ingen tiebreaker — vi er voksne mennesker."],
                ["3.4", "Du kan deltage uden at være med i puljen. Stjerner og placering på ranglisten tæller stadig."],
            ],
        },
        {
            id: "conduct", icon: "handshake", title: "God opførsel",
            items: [
                ["4.1", "Vi snakker gerne strategi op til løbet — men ingen koordinerede bets eller fælles indsendelser."],
                ["4.2", "Ingen bots, scripts eller automatiske systemer. Bettet skal placeres manuelt."],
                ["4.3", "Hvis du opdager en fejl i resultatet eller pointene, skriv til kassereren inden næste løb starter."],
                ["4.4", "Klubben er et hobbyfællesskab. Hold tonen venlig — også når Verstappen vinder igen."],
            ],
        },
    ],
    en: [
        {
            id: "betting", icon: "stopwatch", title: "Bets & deadlines",
            items: [
                ["1.1", "One bet per member per race. You may edit it as long as betting is open."],
                ["1.2", "Betting opens Sunday evening after the previous race and closes exactly 1 minute before lights out."],
                ["1.3", "A bet consists of your top 3 — P1, P2, P3 — in the order you expect them to cross the line."],
                ["1.4", "You can't pick the same driver twice in a single bet."],
                ["1.5", "Forget to place a bet and you score 0 points for that race. No after-the-fact entries."],
            ],
        },
        {
            id: "points", icon: "calculator", title: "Points",
            items: [
                ["2.1", "P1 correct earns 10 points. P2 correct earns 6. P3 correct earns 3."],
                ["2.2", "Picking a driver in the wrong top-3 slot still earns 1 consolation point."],
                ["2.3", "Nail all three in the exact order and you get a star ★ on your profile for the rest of the season."],
                ["2.4", "Sprint races count for half points. The sprint shootout doesn't count at all."],
                ["2.5", "Post-race DSQs update the result and the points — including retroactively."],
            ],
        },
        {
            id: "pool", icon: "coins", title: "The pool",
            items: [
                ["3.1", "The season pool is optional. The buy-in is 200 kr, paid to the treasurer by 15 March."],
                ["3.2", "The pool pays out to the top 3 of the season standings: 60% / 30% / 10%."],
                ["3.3", "On a tie, the members split that prize evenly. No tiebreaker — we're grown-ups."],
                ["3.4", "You can play without joining the pool. Stars and leaderboard position still count."],
            ],
        },
        {
            id: "conduct", icon: "handshake", title: "Good conduct",
            items: [
                ["4.1", "Talking strategy before the race is encouraged — coordinated or joint bets are not."],
                ["4.2", "No bots, scripts, or automated systems. Bets must be placed by hand."],
                ["4.3", "Spotted a mistake in the result or the points? Message the treasurer before the next race begins."],
                ["4.4", "The club is a hobby community. Keep the tone friendly — even when Verstappen wins again."],
            ],
        },
    ],
};
