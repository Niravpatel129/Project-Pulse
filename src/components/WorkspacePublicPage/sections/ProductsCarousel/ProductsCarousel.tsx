export default function ProductsCarousel({ id }: { id: string }) {
  const cardComponents = [
    {
      title: 'Product 1',
      description: 'Description 1',
      image: 'https://via.placeholder.com/150',
    },
  ];

  return (
    <div className='min-h-[50vh] px-6 md:px-10 lg:px-24 py-10 md:py-14'>
      123
      {cardComponents.map((card) => {
        return (
          <div key={card.title}>
            <h3>{card.title}</h3>
          </div>
        );
      })}
    </div>
  );
}
