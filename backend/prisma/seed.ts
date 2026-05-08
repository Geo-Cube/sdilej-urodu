import prisma from '../src/lib/prisma.js'

async function main() {
  await prisma.reservation.deleteMany()
  await prisma.offer.deleteMany()

  const rajcata = await prisma.offer.create({
    data: {
      cropName: 'Rajčata',
      description: 'Čerstvá rajčata ze zahrádky, odrůda San Marzano. Sklizeno včera.',
      availableQuantity: 15,
      stepQuantity: 0.5,
      maxQuantity: 3,
      price: 0,
      isFree: true,
      unit: 'KG',
      farmerName: 'Jana Novotná',
      email: 'jana.novotna@example.com',
      phone: '+420 777 123 456',
      street: 'Zahradní 12',
      city: 'Brno',
      zipCode: '602 00',
      pickupMethod: 'BOTH',
      pickupInstructions: 'Zavolejte předem. Osobní předání odpoledne, nebo nechám v košíku před brankou.',
    },
  })

  const cukety = await prisma.offer.create({
    data: {
      cropName: 'Cukety',
      description: 'Přerostlé cukety — skvělé na plnění nebo do polévky.',
      availableQuantity: 20,
      stepQuantity: 1,
      maxQuantity: 5,
      price: 10,
      isFree: false,
      unit: 'KS',
      farmerName: 'Petr Dvořák',
      email: 'petr.dvorak@example.com',
      phone: '+420 603 987 654',
      street: 'U Staré Lípy 3',
      city: 'Praha 6',
      zipCode: '160 00',
      pickupMethod: 'NON_CONTACT',
      pickupInstructions: 'Bedýnka u vchodové branky. Platba QR kódem na místě.',
    },
  })

  const jablka = await prisma.offer.create({
    data: {
      cropName: 'Jablka Boskoopská',
      description: 'Klasická podzimní odrůda, ideální na jablečník i přímou konzumaci.',
      availableQuantity: 50,
      stepQuantity: 1,
      maxQuantity: 10,
      price: 25,
      isFree: false,
      unit: 'KG',
      farmerName: 'Marie Horáčková',
      email: 'marie.horackova@example.com',
      phone: '+420 731 456 789',
      street: 'Polní 7',
      city: 'Olomouc',
      zipCode: '779 00',
      pickupMethod: 'PERSONAL',
      pickupInstructions: 'Domluvte termín emailem, přijdu vám otevřít zahradu.',
    },
  })

  await prisma.offer.create({
    data: {
      cropName: 'Bylinky — mix',
      description: 'Svazky čerstvé bazalky, petržele a pažitky z vlastního záhonu.',
      availableQuantity: 30,
      stepQuantity: 1,
      price: 0,
      isFree: true,
      unit: 'KS',
      farmerName: 'Tomáš Beneš',
      email: 'tomas.benes@example.com',
      phone: '+420 724 111 222',
      street: 'Rybářská 22',
      city: 'České Budějovice',
      zipCode: '370 01',
      pickupMethod: 'NON_CONTACT',
      pickupInstructions: 'Svazky visí na háku u vrat. Berte, kolik potřebujete!',
    },
  })

  await prisma.reservation.create({
    data: {
      offerId: rajcata.id,
      reserverName: 'Karel Procházka',
      reserverEmail: 'karel.prochazka@example.com',
      reserverPhone: '+420 605 333 444',
      reservedQuantity: 2,
      selectedPickupMethod: 'PERSONAL',
    },
  })

  await prisma.reservation.create({
    data: {
      offerId: cukety.id,
      reserverName: 'Eva Říhová',
      reserverEmail: 'eva.rihova@example.com',
      reserverPhone: '+420 777 888 999',
      reservedQuantity: 3,
      selectedPickupMethod: 'NON_CONTACT',
    },
  })

  await prisma.reservation.create({
    data: {
      offerId: jablka.id,
      reserverName: 'Ondřej Kratochvíl',
      reserverEmail: 'ondrej.kratochvil@example.com',
      reserverPhone: '+420 608 222 333',
      reservedQuantity: 5,
      selectedPickupMethod: 'PERSONAL',
    },
  })

  console.log('Seed dokončen — 4 nabídky, 3 rezervace.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
