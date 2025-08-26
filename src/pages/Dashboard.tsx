import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserCheck, Clock } from 'lucide-react';
import { mockPatients, mockAppointments } from '@/store/mockData';

export default function Dashboard() {
  const totalPatients = mockPatients.length;
  const todayAppointments = mockAppointments.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  ).length;
  const confirmedAppointments = mockAppointments.filter(apt => apt.status === 'confirmed').length;
  const pendingAppointments = mockAppointments.filter(apt => apt.status === 'scheduled').length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: "Today's Appointments",
      value: todayAppointments,
      icon: Calendar,
      color: 'text-secondary-foreground',
    },
    {
      title: 'Confirmed Appointments',
      value: confirmedAppointments,  
      icon: UserCheck,
      color: 'text-primary',
    },
    {
      title: 'Pending Appointments',
      value: pendingAppointments,
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your medical practice management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-sm">
                <div className="font-medium">New patient registered</div>
                <div className="text-muted-foreground">Alice Wilson - 2 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Appointment confirmed</div>
                <div className="text-muted-foreground">John Doe - 3 hours ago</div>
              </div>
              <div className="text-sm">
                <div className="font-medium">Appointment completed</div>
                <div className="text-muted-foreground">Patient visit finished - 5 hours ago</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockAppointments
                .filter(apt => new Date(apt.appointmentDate) >= new Date())
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="text-sm">
                    <div className="font-medium">
                      {appointment.appointmentTime} - {appointment.type}
                    </div>
                    <div className="text-muted-foreground">
                      {appointment.appointmentDate}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                Add New Patient
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                Book Appointment
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                Generate QR Code
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                View Reports
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}