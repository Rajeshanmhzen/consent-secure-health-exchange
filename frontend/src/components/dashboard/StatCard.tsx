import { motion } from 'framer-motion'

type StatCardProps = {
    label: string
    value: string | number
    icon: React.ReactNode
    color: string
    index?: number
}

const StatCard = ({ label, value, icon, color, index = 0 }: StatCardProps) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.07, duration: 0.35, ease: 'easeOut' }}
            className="rounded-2xl p-5"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
            <div className="flex items-center justify-center gap-2 mb-3">
                <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: 'var(--color-surface-elevated)', color }}
                >
                    {icon}
                </div>
                <p className="text-2xl font-semibold" style={{ color: 'var(--color-text-secondary)' }}>{label}</p>
            </div>
            <p className="text-4xl font-extrabold text-center" style={{ color: 'var(--color-text)' }}>{value}</p>
        </motion.div>
    )
}

export default StatCard
