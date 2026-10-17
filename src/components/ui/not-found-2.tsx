import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyTitle,
} from "@/components/ui/empty";
import { HomeIcon } from "lucide-react";

export function NotFound() {
	return (
		<div className="relative flex min-h-screen w-full items-center justify-center p-4 sm:p-6 bg-[#060913] text-slate-100 overflow-hidden">
			{/* Ambient Glow */}
			<div className="absolute top-1/3 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
			<div className="absolute bottom-1/3 -right-20 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

			<Empty className="relative z-10 max-w-md w-full">
				<EmptyHeader className="space-y-4">
					<EmptyTitle className="font-black text-7xl sm:text-8xl md:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-200 to-slate-500 select-none">
						404
					</EmptyTitle>
					<EmptyDescription className="text-sm sm:text-base text-slate-400 text-center text-balance max-w-xs mx-auto leading-relaxed">
						Trang bạn đang tìm kiếm có thể đã được di chuyển hoặc không tồn tại trên hệ thống
					</EmptyDescription>
				</EmptyHeader>
				<EmptyContent className="pt-2">
					<div className="flex items-center justify-center">
						<Button asChild size="lg">
							<a href="/">
								<HomeIcon className="size-4 mr-2" data-icon="inline-start" />
								Về trang chủ
							</a>
						</Button>
					</div>
				</EmptyContent>
			</Empty>
		</div>
	);
}
export default NotFound;
