import booking from "./booking.json"
import brackets from "./brackets.json"
import create from "./create.json"
import dashboard from "./dashboard.json"
import events from "./events.json"
import general from "./general.json"
import liveControl from "./live-control.json"
import registrations from "./registrations.json"
import scheduling from "./scheduling.json"
import seeding from "./seeding.json"
import teamMatching from "./team-matching.json"

const viTournament = {
  ...general,
  ...dashboard,
  ...create,
  ...events,
  ...registrations,
  ...teamMatching,
  ...seeding,
  ...brackets,
  ...scheduling,
  ...liveControl,
  ...booking,
}

export default viTournament
