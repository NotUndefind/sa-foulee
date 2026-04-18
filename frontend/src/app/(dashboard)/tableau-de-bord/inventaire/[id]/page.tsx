import EquipmentDetailPage from '@/components/features/inventory/EquipmentDetailPage'

interface Props {
  params: Promise
}

export default async function Page({ params }: Props) {
  const { id } = await params
  return <EquipmentDetailPage id={parseInt(id, 10)} />
}
