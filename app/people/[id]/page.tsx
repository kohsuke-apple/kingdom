import { notFound } from 'next/navigation'
import { personRepository } from '@/lib/repository'
import { PersonDetail } from '@/components/person-detail'

type Props = {
  params: Promise<{ id: string }>
}

export default async function PersonPage({ params }: Props) {
  const { id } = await params
  const person = await personRepository.findById(id)

  if (!person) {
    notFound()
  }

  return <PersonDetail person={person} />
}
