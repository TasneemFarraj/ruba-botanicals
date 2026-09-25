export default function Spinner({ size = 20 }: { size?: number }) {
  return (
    <div className="flex justify-center items-center py-16">
      <div
        className="rounded-full border-2 animate-spin"
        style={{
          width: size,
          height: size,
          borderColor: 'var(--forest)',
          borderTopColor: 'transparent',
        }}
      />
    </div>
  )
}
