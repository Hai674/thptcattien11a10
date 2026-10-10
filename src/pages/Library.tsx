import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { GlassButton } from '@/components/ui/glass-button';
import { Card } from '@/components/ui/card';
import {
  Image,
  Upload,
  Heart,
  MessageCircle,
  Share2,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Send,
  Camera,
  Sparkles,
  Plus,
  MoreHorizontal,
  GraduationCap,
} from 'lucide-react';
import { toast } from 'sonner';

interface PostComment {
  id: string;
  author: string;
  avatar?: string;
  content: string;
  createdAt: string;
}

interface PhotoPost {
  id: string;
  authorName: string;
  authorAvatar?: string;
  role: string;
  caption: string;
  images: string[];
  likes: number;
  likedByMe: boolean;
  comments: PostComment[];
  createdAt: string;
}

const INITIAL_POSTS: PhotoPost[] = [];

export const LibraryPage: React.FC = () => {
  const { user } = useAuth();

  const [posts, setPosts] = useState<PhotoPost[]>(() => {
    const saved = localStorage.getItem('11a10_photo_posts');
    if (saved) {
      try {
        const list = JSON.parse(saved);
        // Tự động dọn sạch nếu dữ liệu cũ còn chứa các bài đăng demo post-1 / post-2
        if (
          Array.isArray(list) &&
          list.length > 0 &&
          list.some((p: PhotoPost) => p.id === 'post-1' || p.id === 'post-2')
        ) {
          const cleaned = list.filter((p: PhotoPost) => p.id !== 'post-1' && p.id !== 'post-2');
          localStorage.setItem('11a10_photo_posts', JSON.stringify(cleaned));
          return cleaned;
        }
        return list;
      } catch {
        return [];
      }
    }
    return [];
  });

  // State tạo bài viết mới
  const [newCaption, setNewCaption] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State xem ảnh phóng to (Lightbox Modal)
  const [activeLightbox, setActiveLightbox] = useState<{
    images: string[];
    currentIndex: number;
  } | null>(null);

  // State mở khung comment
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});



  // Lưu posts vào localStorage
  useEffect(() => {
    localStorage.setItem('11a10_photo_posts', JSON.stringify(posts));
  }, [posts]);

  // Xử lý upload ảnh từ máy tính
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Tệp ${file.name} không phải là hình ảnh`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (result) {
          setUploadedImages((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });

    toast.success('Đã nạp ảnh đính kèm thành công');
    if (e.target) e.target.value = '';
  };

  const removeUploadedImage = (index: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Đăng bài viết mới
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCaption.trim() && uploadedImages.length === 0) {
      toast.error('Vui lòng nhập nội dung hoặc đính kèm ảnh để đăng');
      return;
    }

    setIsSubmitting(true);

    const newPost: PhotoPost = {
      id: `post-${Date.now()}`,
      authorName: user?.displayName || 'Thành viên 11A10',
      authorAvatar: user?.photoURL || undefined,
      role: user?.role === 'admin' ? 'Quản trị viên' : 'Học sinh 11A10',
      caption: newCaption.trim(),
      images: [...uploadedImages],
      likes: 1,
      likedByMe: true,
      comments: [],
      createdAt: 'Vừa xong',
    };

    setPosts([newPost, ...posts]);
    setNewCaption('');
    setUploadedImages([]);
    setIsSubmitting(false);
    toast.success('Đã đăng khoảnh khắc kỷ niệm lên bảng tin lớp');
  };

  // Like / Unlike
  const handleToggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          const liked = !p.likedByMe;
          return {
            ...p,
            likedByMe: liked,
            likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1),
          };
        }
        return p;
      })
    );
  };

  // Gửi bình luận
  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: PostComment = {
      id: `c-${Date.now()}`,
      author: user?.displayName || 'Thành viên 11A10',
      avatar: user?.photoURL || undefined,
      content: text,
      createdAt: 'Vừa xong',
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
    toast.success('Đã gửi bình luận');
  };

  // Xóa bài viết
  const handleDeletePost = (postId: string) => {
    if (window.confirm('Bạn có chắc muốn xóa bài đăng này khỏi thư viện ảnh?')) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      toast.success('Đã xóa bài viết');
    }
  };

  // Xóa toàn bộ dữ liệu demo
  const handleClearDemoPosts = () => {
    if (window.confirm('Bạn có muốn xóa các bài đăng mẫu để bắt đầu chia sẻ ảnh thật của lớp?')) {
      setPosts([]);
      toast.success('Đã xóa bài đăng mẫu');
    }
  };

  // Render lưới ảnh phong cách Facebook
  const renderFacebookPhotoGrid = (images: string[]) => {
    if (!images || images.length === 0) return null;

    const count = images.length;

    // 1 ảnh: tràn viền
    if (count === 1) {
      return (
        <div
          onClick={() => setActiveLightbox({ images, currentIndex: 0 })}
          className="cursor-pointer overflow-hidden max-h-[520px] bg-black/40 flex items-center justify-center group"
        >
          <img
            src={images[0]}
            alt="Kỷ niệm 11A10"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
          />
        </div>
      );
    }

    // 2 ảnh: chia đôi
    if (count === 2) {
      return (
        <div className="grid grid-cols-2 gap-1 max-h-[420px] overflow-hidden bg-black/40">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveLightbox({ images, currentIndex: i })}
              className="cursor-pointer h-72 overflow-hidden group"
            >
              <img
                src={img}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      );
    }

    // 3 ảnh: 1 lớn bên trái, 2 nhỏ bên phải
    if (count === 3) {
      return (
        <div className="grid grid-cols-2 gap-1 max-h-[460px] overflow-hidden bg-black/40">
          <div
            onClick={() => setActiveLightbox({ images, currentIndex: 0 })}
            className="cursor-pointer h-full min-h-[300px] overflow-hidden group"
          >
            <img
              src={images[0]}
              alt="Ảnh 1"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="grid grid-rows-2 gap-1 h-full">
            {images.slice(1, 3).map((img, i) => (
              <div
                key={i}
                onClick={() => setActiveLightbox({ images, currentIndex: i + 1 })}
                className="cursor-pointer h-[150px] overflow-hidden group"
              >
                <img
                  src={img}
                  alt={`Ảnh ${i + 2}`}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        </div>
      );
    }

    // 4 ảnh: lưới 2x2
    if (count === 4) {
      return (
        <div className="grid grid-cols-2 gap-1 max-h-[480px] overflow-hidden bg-black/40">
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setActiveLightbox({ images, currentIndex: i })}
              className="cursor-pointer h-56 overflow-hidden group"
            >
              <img
                src={img}
                alt={`Ảnh ${i + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          ))}
        </div>
      );
    }

    // 5+ ảnh: 3 ảnh đầu + ô thứ 4 có lớp phủ +N
    const remaining = count - 4;
    return (
      <div className="grid grid-cols-2 gap-1 max-h-[480px] overflow-hidden bg-black/40">
        {images.slice(0, 3).map((img, i) => (
          <div
            key={i}
            onClick={() => setActiveLightbox({ images, currentIndex: i })}
            className="cursor-pointer h-56 overflow-hidden group"
          >
            <img
              src={img}
              alt={`Ảnh ${i + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        ))}
        {/* Ô thứ 4 có số lượng ảnh còn lại */}
        <div
          onClick={() => setActiveLightbox({ images, currentIndex: 3 })}
          className="relative cursor-pointer h-56 overflow-hidden group"
        >
          <img
            src={images[3]}
            alt="Ảnh 4"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center text-white font-extrabold text-2xl transition-all group-hover:bg-black/50">
            +{remaining + 1}
          </div>
        </div>
      </div>
    );
  };



  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300 pb-20">
      {/* Ẩn input chọn ảnh */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Header Banner Thư viện */}
      <Card className="p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-blue-300 text-xs font-mono mb-2">
            <Camera className="w-3.5 h-3.5 text-blue-400" />
            <span>Kỷ Yếu Kỹ Thuật Số • 11A10</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Thư Viện &amp; Kho Lưu Trữ Lớp
          </h1>
          <p className="text-xs text-slate-300 mt-1">
            Không gian chia sẻ hình ảnh kỷ niệm và tài liệu học tập niên khóa 2026 - 2027 THPT Cát Tiên
          </p>
        </div>

        {posts.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearDemoPosts}
            className="text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl"
            title="Làm trống để đăng ảnh của riêng lớp"
          >
            Làm trống bảng tin
          </Button>
        )}
      </Card>

      {/* Hộp tạo bài viết phong cách Facebook */}
      <Card className="p-5 sm:p-6 rounded-3xl space-y-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 border border-blue-500/30">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user?.displayName?.charAt(0) || 'U'
            )}
          </div>

          <div className="flex-1 space-y-3">
            <textarea
              value={newCaption}
              onChange={(e) => setNewCaption(e.target.value)}
              placeholder={`${user?.displayName || 'Bạn'} ơi, hôm nay lớp 11A10 có kỷ niệm hay bức ảnh nào đẹp muốn lưu lại không?`}
              rows={3}
              className="w-full bg-white/[0.06] border border-white/20 rounded-2xl p-3.5 text-xs sm:text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-white/40 focus:bg-white/[0.09] shadow-inner backdrop-blur-md resize-none transition-all"
            />

            {/* Danh sách ảnh đính kèm xem trước */}
            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-2.5 p-3 rounded-2xl bg-black/40 border border-white/5">
                {uploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 group">
                    <img src={img} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeUploadedImage(idx)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/70 hover:bg-red-600 text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border border-dashed border-white/20 hover:border-blue-400 bg-white/5 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-all text-[10px] gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>
            )}

            {/* Thanh công cụ đính kèm & Nút đăng bài */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-white/10">
              <GlassButton
                type="button"
                size="sm"
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="w-4 h-4 text-emerald-400" />
                <span>Thêm ảnh từ máy ({uploadedImages.length})</span>
              </GlassButton>

              <GlassButton
                size="sm"
                type="button"
                variant="primary"
                onClick={handleCreatePost}
                disabled={isSubmitting || (!newCaption.trim() && uploadedImages.length === 0)}
              >
                <Send className="w-3.5 h-3.5 text-white" />
                <span>Đăng khoảnh khắc</span>
              </GlassButton>
            </div>
          </div>
        </div>
      </Card>

      {/* Dòng thời gian bài đăng (Feed) */}
      <div className="space-y-6">
        {posts.length === 0 ? (
          <Card className="text-center py-16 p-8 rounded-3xl space-y-3">
            <Camera className="w-12 h-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Chưa có bài đăng kỷ niệm nào</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Hãy là người đầu tiên đăng tải những bức ảnh kỷ niệm tuyệt đẹp của tập thể lớp 11A10 niên khóa 2026 - 2027
            </p>
            <div className="flex justify-center pt-2">
              <GlassButton
                size="default"
                variant="primary"
                onClick={() => fileInputRef.current?.click()}
              >
                <Camera className="w-4 h-4 text-white" />
                <span>Chọn ảnh và đăng ngay</span>
              </GlassButton>
            </div>
          </Card>
        ) : (
          posts.map((post) => (
            <Card
              key={post.id}
              className="rounded-3xl shadow-xl overflow-hidden transition-all hover:scale-[1.005]"
            >
              {/* Header bài đăng */}
              <div className="p-4 sm:p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-blue-600 flex items-center justify-center text-white font-bold text-sm border border-blue-500/30">
                    {post.authorAvatar ? (
                      <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                    ) : (
                      post.authorName.charAt(0)
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-white">{post.authorName}</h4>
                      <span className="text-[10px] font-mono text-blue-300">
                        {post.role}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400">{post.createdAt} • Tập thể 11A10</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeletePost(post.id)}
                  className="p-2 rounded-xl text-slate-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                  title="Xóa bài viết này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Caption */}
              {post.caption && (
                <div className="px-5 pb-3.5 text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                  {post.caption}
                </div>
              )}

              {/* Lưới ảnh chuẩn Facebook */}
              {renderFacebookPhotoGrid(post.images)}

              {/* Thống kê lượt thích & bình luận */}
              <div className="px-5 py-2.5 flex items-center justify-between text-xs text-slate-400 border-b border-white/5 font-mono">
                <span className="flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-400">
                    <Heart className="w-3 h-3 fill-rose-500 text-rose-500" />
                  </span>
                  <span>{post.likes} lượt thích</span>
                </span>
                <span>{post.comments.length} bình luận</span>
              </div>

              {/* Thanh nút bấm tương tác */}
              <div className="px-2 py-1.5 grid grid-cols-3 gap-1 border-b border-white/5 text-xs">
                <button
                  type="button"
                  onClick={() => handleToggleLike(post.id)}
                  className={`py-2 rounded-xl flex items-center justify-center gap-2 font-medium transition-colors ${
                    post.likedByMe
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-slate-300 hover:bg-white/5'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${post.likedByMe ? 'fill-rose-400 text-rose-400' : ''}`}
                  />
                  <span>{post.likedByMe ? 'Đã thích' : 'Thích'}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setOpenCommentPostId(openCommentPostId === post.id ? null : post.id)
                  }
                  className="py-2 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:bg-white/5 font-medium transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-blue-400" />
                  <span>Bình luận</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Đã sao chép liên kết bài viết');
                  }}
                  className="py-2 rounded-xl flex items-center justify-center gap-2 text-slate-300 hover:bg-white/5 font-medium transition-colors"
                >
                  <Share2 className="w-4 h-4 text-indigo-400" />
                  <span>Chia sẻ</span>
                </button>
              </div>

              {/* Khu vực bình luận */}
              {(openCommentPostId === post.id || post.comments.length > 0) && (
                <div className="p-4 sm:p-5 bg-black/20 space-y-3">
                  {/* Danh sách bình luận */}
                  {post.comments.length > 0 && (
                    <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                      {post.comments.map((comment) => (
                        <div key={comment.id} className="flex items-start gap-2.5 text-xs">
                          <div className="w-7 h-7 rounded-full bg-blue-600/80 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0">
                            {comment.avatar ? (
                              <img src={comment.avatar} alt={comment.author} className="w-full h-full object-cover rounded-full" />
                            ) : (
                              comment.author.charAt(0)
                            )}
                          </div>
                          <div className="flex-1 bg-white/[0.04] border border-white/5 rounded-2xl px-3.5 py-2">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <span className="font-semibold text-white">{comment.author}</span>
                              <span className="text-[10px] text-slate-500 font-mono">{comment.createdAt}</span>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{comment.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Ô nhập bình luận */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={commentInputs[post.id] || ''}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddComment(post.id);
                      }}
                      placeholder="Viết bình luận cho bạn bè..."
                      className="flex-1 h-9 bg-white/[0.06] border border-white/20 rounded-xl px-3.5 text-xs text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 backdrop-blur-md"
                    />
                    <GlassButton
                      type="button"
                      size="sm"
                      variant="primary"
                      onClick={() => handleAddComment(post.id)}
                      title="Gửi bình luận"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </GlassButton>
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>


      {/* Lightbox Modal phóng to ảnh */}
      {activeLightbox && (
        <div
          onClick={() => setActiveLightbox(null)}
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in"
        >
          {/* Nút đóng */}
          <button
            type="button"
            onClick={() => setActiveLightbox(null)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-50"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Nút lùi */}
          {activeLightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightbox({
                  ...activeLightbox,
                  currentIndex:
                    (activeLightbox.currentIndex - 1 + activeLightbox.images.length) %
                    activeLightbox.images.length,
                });
              }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Ảnh chính */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex items-center justify-center"
          >
            <img
              src={activeLightbox.images[activeLightbox.currentIndex]}
              alt="Ảnh phóng to"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
          </div>

          {/* Nút tiến */}
          {activeLightbox.images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setActiveLightbox({
                  ...activeLightbox,
                  currentIndex:
                    (activeLightbox.currentIndex + 1) % activeLightbox.images.length,
                });
              }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Chỉ số ảnh (1/4) */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-white/10 border border-white/15 text-white font-mono text-xs">
            {activeLightbox.currentIndex + 1} / {activeLightbox.images.length}
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryPage;
