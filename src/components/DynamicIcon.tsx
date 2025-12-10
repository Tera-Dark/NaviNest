import React, { lazy, Suspense, useMemo } from 'react';
import dynamicIconImports from 'lucide-react/dynamicIconImports.mjs';

const fallback = <div style={{ width: 24, height: 24, background: 'rgba(150,150,150,0.1)', borderRadius: 4 }} />;

interface DynamicIconProps {
  name: string;
  className?: string;
  size?: number;
}

export const DynamicIcon: React.FC<DynamicIconProps> = ({ name, className, size = 24 }) => {
  const Icon = useMemo(() => {
    // 1. Try direct match (e.g. 'home', 'message-square')
    if (name in dynamicIconImports) {
        return lazy(dynamicIconImports[name as keyof typeof dynamicIconImports]);
    }

    // 2. Try lower case (e.g. 'Home' -> 'home', 'GitHub' -> 'github')
    const lowerName = name.toLowerCase();
    if (lowerName in dynamicIconImports) {
        return lazy(dynamicIconImports[lowerName as keyof typeof dynamicIconImports]);
    }

    // 3. Try kebab-case for PascalCase inputs (e.g. 'MessageSquare' -> 'message-square')
    const kebabName = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    if (kebabName in dynamicIconImports) {
        return lazy(dynamicIconImports[kebabName as keyof typeof dynamicIconImports]);
    }

    return null;
  }, [name]);

  if (!Icon) {
    // Fallback if icon not found
    return <span className={className} style={{ width: size, height: size, display: 'inline-block', background: 'rgba(150,150,150,0.1)', borderRadius: 4 }} title={`Icon not found: ${name}`}></span>;
  }

  return (
    <Suspense fallback={fallback}>
      <Icon className={className} size={size} />
    </Suspense>
  );
};
