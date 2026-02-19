import { notFound } from 'next/navigation'
import { personRepository } from '@/lib/repository'
import { PersonForm } from '@/components/person-form'

type Props = {
  params: Promise<{ id: string }>
}

export default async function EditPersonPage({ params }: Props) {
  const { id } = await params
  const person = await personRepository.findById(id)

  if (!person) {
    notFound()
  }

  return <PersonForm person={person} />
}
