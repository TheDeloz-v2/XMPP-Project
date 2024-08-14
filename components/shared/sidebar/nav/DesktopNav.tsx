"use client";

import { Card } from '@/components/ui/card';
import { useNavigation } from '@/hooks/useNavigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";

const DesktopNav = () => {
    const paths = useNavigation();

    return (
    
    <Card className="hidden lg:flex lg:flex-col 
    lg:justify-between lg:items-center 
    lg:h-full lg:w-16 lg:px-2 lg:py-4">
        <nav>
            <ul className="flex flex-col items-center gap-4">{
                paths.map((path, id) => {
                    return (
                        <li key={id} className="relative">
                            <Link href={path.href}>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Button 
                                        size="icon" 
                                        variant={path.active ? 'default' : 'outline'}>
                                            {path.icon}
                                        </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {path.name}
                                    </TooltipContent>
                                </Tooltip>
                            </Link>
                        </li>
                    );
                })
            }</ul>
        </nav>
    </Card>
    );
};

export default DesktopNav;