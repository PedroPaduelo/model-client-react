import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'

export default function DahsAgout() {
  return (
    <section className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Sobre</CardTitle>
          <CardDescription>Informações gerais do módulo</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Este módulo demonstra o uso do shadcn/ui com navegação lateral e componentes acessíveis.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Perguntas frequentes</CardTitle>
          <CardDescription>Algumas dúvidas comuns</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Como alterno o menu lateral?</AccordionTrigger>
              <AccordionContent>Use o botão no topo (atalho: Ctrl/Cmd + b).</AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Posso usar tema escuro?</AccordionTrigger>
              <AccordionContent>Sim, a paleta está pronta para dark mode.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </section>
  )
}
