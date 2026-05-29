import { motion } from 'framer-motion'

export type TabItem<T extends string> = {
    key: T
    label: string
}

export type FilterTabsProps<T extends string> = {
    tabs: readonly TabItem<T>[]
    value: T
    onChange: (val: T) => void
    layoutId?: string
}

export const FilterTabs = <T extends string>({ tabs, value, onChange, layoutId = "activeTabUnderline" }: FilterTabsProps<T>) => {
    return (
        <div className="flex border-b w-full mt-2 overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
            {tabs.map(t => {
                const isActive = value === t.key
                return (
                    <button
                        key={t.key}
                        type="button"
                        onClick={() => onChange(t.key)}
                        className="relative py-3 px-5 text-xs sm:text-sm font-semibold transition-colors cursor-pointer select-none outline-none whitespace-nowrap"
                        style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
                        }}
                    >
                        {t.label}
                        {isActive && (
                            <motion.div
                                layoutId={layoutId}
                                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                                style={{ backgroundColor: 'var(--color-primary)' }}
                                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                            />
                        )}
                    </button>
                )
            })}
        </div>
    )
}

export default FilterTabs;
