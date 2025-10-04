export default function MemberTable({ members }) {
  return (
    <table className="min-w-full table-auto border-collapse">
      <thead className="bg-blue-600 text-white">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Email</th>
          <th className="px-4 py-2">Reg No</th>
          <th className="px-4 py-2">OTP / Password</th>
          <th className="px-4 py-2">Admin</th>
          <th className="px-4 py-2">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {members.length === 0 && (
          <tr>
            <td colSpan="6" className="text-center py-4 text-gray-500">
              No members found
            </td>
          </tr>
        )}
        {members.map((member, idx) => (
          <tr key={idx} className={idx % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}>
            <td className="border px-4 py-2">{member.name}</td>
            <td className="border px-4 py-2">{member.email}</td>
            <td className="border px-4 py-2">{member.regNo}</td>
            <td className="border px-4 py-2">{member.password || member.otp}</td>
            <td className="border px-4 py-2">{member.adminEmail}</td>
            <td className="border px-4 py-2">{member.timestamp}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}