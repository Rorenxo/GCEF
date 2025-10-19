

export default function Dashboard() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#0C342C]">Organizer Dashboard</h1>
      <p className="mt-2 text-zinc-600">
        Welcome to your dashboard! Manage your events, view upcoming schedules, and more.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold text-[#0C342C]">Active Events</h2>
          <p className="text-3xl font-bold mt-2 text-[#076653]">3</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold text-[#0C342C]">Pending Requests</h2>
          <p className="text-3xl font-bold mt-2 text-[#076653]">1</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-md">
          <h2 className="text-lg font-semibold text-[#0C342C]">Total Attendees</h2>
          <p className="text-3xl font-bold mt-2 text-[#076653]">124</p>
        </div>
      </div>
    </div>
  )
}
