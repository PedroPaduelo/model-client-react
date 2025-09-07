import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'

export default function Teste() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Exemplo shadcn/ui</CardTitle>
          <CardDescription>Pequena vitrine de componentes.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex gap-2">
            <Button onClick={() => toast.success('Ação executada')}>Primário</Button>
            <Button variant="secondary">Secundário</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Input placeholder="Campo de texto" />
            <Input type="email" placeholder="email@exemplo.com" />
          </div>
          <Tabs defaultValue="tab1">
            <TabsList>
              <TabsTrigger value="tab1">Aba 1</TabsTrigger>
              <TabsTrigger value="tab2">Aba 2</TabsTrigger>
            </TabsList>
            <TabsContent value="tab1">Conteúdo da aba 1</TabsContent>
            <TabsContent value="tab2">Conteúdo da aba 2</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
