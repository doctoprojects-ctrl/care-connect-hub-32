import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, UserCheck, Clock } from 'lucide-react';
import { mockPatients, mockAppointments } from '@/store/mockData';
import { useT } from '@/contexts/LanguageContext';
import { useDataVersion } from '@/lib/supabaseSync';

export default function Dashboard() {
  const t = useT();
  useDataVersion();
  const totalPatients = mockPatients.length;
  const todayAppointments = mockAppointments.filter(apt => 
    apt.appointmentDate === new Date().toISOString().split('T')[0]
  ).length;
  const confirmedAppointments = mockAppointments.filter(apt => apt.status === 'confirmed').length;
  const pendingAppointments = mockAppointments.filter(apt => apt.status === 'scheduled').length;

  const stats = [
    {
      title: t('stat_total_patients'),
      value: totalPatients,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: t('stat_today_appts'),
      value: todayAppointments,
      icon: Calendar,
      color: 'text-secondary-foreground',
    },
    {
      title: t('stat_confirmed_appts'),
      value: confirmedAppointments,  
      icon: UserCheck,
      color: 'text-primary',
    },
    {
      title: t('stat_pending_appts'),
      value: pendingAppointments,
      icon: Clock,
      color: 'text-muted-foreground',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t('nav_dashboard')}</h2>
        <p className="text-muted-foreground">{t('dashboard_welcome')}</p>
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
            <CardTitle>{t('recent_activity')}</CardTitle>
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
            <CardTitle>{t('upcoming_appts')}</CardTitle>
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
            <CardTitle>{t('quick_actions')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                {t('qa_add_patient')}
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                {t('qa_book_appt')}
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                {t('qa_generate_qr')}
              </button>
              <button className="w-full text-left text-sm hover:bg-accent p-2 rounded">
                {t('qa_view_reports')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}