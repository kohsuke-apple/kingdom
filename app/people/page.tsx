import { personRepository } from '@/lib/repository'
import { PeopleList } from '@/components/people-list'

type Props = {
  searchParams: Promise<{ q?: string; tag?: string; sort?: string }>
}

export default async function PeoplePage({ searchParams }: Props) {
  const { q, tag, sort } = await searchParams

  let people
  if (q) {
    people = await personRepository.search(q)
  } else if (tag) {
    const all = await personRepository.findAll()
    people = all.filter(p =>
      p.tags?.some(t => t.toLowerCase() === tag.toLowerCase())
    )
  } else {
    people = await personRepository.findAll()
  }

  if (sort === 'birthday') {
    people = people.sort((a, b) => {
      if (!a.birthDate) return 1
      if (!b.birthDate) return -1
      return a.birthDate.substring(5).localeCompare(b.birthDate.substring(5))
    })
  }

  const allTags = await personRepository.getAllTags()

  return (
    <PeopleList
      people={people}
      allTags={allTags}
      currentQuery={q}
      currentTag={tag}
      currentSort={sort}
    />
  )
}
