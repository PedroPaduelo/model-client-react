import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

const data = [
  { month: 'Jan', users: 120, sales: 80 },
  { month: 'Fev', users: 160, sales: 90 },
  { month: 'Mar', users: 180, sales: 110 },
  { month: 'Abr', users: 220, sales: 150 },
  { month: 'Mai', users: 260, sales: 170 },
  { month: 'Jun', users: 300, sales: 190 },
]

export default function DahsHome() {
  return (
    <section className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Usuários</CardDescription>
            <CardTitle className="text-2xl">3.247</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Vendas</CardDescription>
            <CardTitle className="text-2xl">R$ 84.120</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Taxa de Conversão</CardDescription>
            <CardTitle className="text-2xl">4,2%</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Assinaturas</CardDescription>
            <CardTitle className="text-2xl">+128</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão geral</CardTitle>
          <CardDescription>Usuários e Vendas nos últimos 6 meses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              users: { label: 'Usuários', color: 'oklch(70% 0.12 255)' },
              sales: { label: 'Vendas', color: 'oklch(70% 0.14 35)' },
            }}
            className="h-[300px]"
          >
            <AreaChart data={data} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="month" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={32} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <defs>
                <linearGradient id="fillUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-users)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-users)" stopOpacity={0.1} />
                </linearGradient>
                <linearGradient id="fillSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-sales)" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="var(--color-sales)" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="users" stroke="var(--color-users)" fill="url(#fillUsers)" />
              <Area type="monotone" dataKey="sales" stroke="var(--color-sales)" fill="url(#fillSales)" />
              <ChartLegend content={<ChartLegendContent />} />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}
