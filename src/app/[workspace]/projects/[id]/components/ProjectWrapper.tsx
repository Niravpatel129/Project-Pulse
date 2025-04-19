export default function ProjectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className='min-h-screen w-full mt-0 md:mt-4 flex flex-col gap-4 px-0 lg:px-[5%] mb-10 xs:px-0 mx-auto  pt-2'>
      {children}
    </div>
  );
}
