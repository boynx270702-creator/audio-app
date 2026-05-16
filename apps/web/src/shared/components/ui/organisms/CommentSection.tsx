'use client';

import * as React from 'react';
import { MessageSquare, Send, ThumbsUp, Reply } from 'lucide-react';
import { socialApi } from '@/shared/services/api.service';
import { useAuthStore } from '@/shared/stores/useAuthStore';
import { Button } from '@/shared/components/ui/atoms/Button';
import { Input } from '@/shared/components/ui/atoms/Input';
import { cn } from '@/shared/utils/cn';

interface CommentSectionProps {
  targetId: string;
  targetType: 'STORY' | 'CHAPTER';
}

export function CommentSection({ targetId, targetType }: CommentSectionProps) {
  const { user, isAuthenticated } = useAuthStore();
  const [comments, setComments] = React.useState<any[]>([]);
  const [content, setContent] = React.useState('');
  const [replyTo, setReplyTo] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadComments = React.useCallback(async () => {
    try {
      const res = await socialApi.getComments(targetId, targetType);
      setComments(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [targetId, targetType]);

  React.useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !isAuthenticated) return;

    try {
      const newComment = await socialApi.createComment({
        targetId,
        targetType,
        content,
        parentId: replyTo?.id,
      });
      
      if (replyTo) {
        setComments(prev => prev.map(c => 
          c.id === replyTo.id ? { ...c, replies: [...(c.replies || []), newComment] } : c
        ));
        setReplyTo(null);
      } else {
        setComments(prev => [newComment, ...prev]);
      }
      setContent('');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 pt-10 border-t mt-20">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-6 w-6 text-primary" />
        <h2 className="text-heading text-xl font-bold">Bình luận</h2>
      </div>

      {/* Input area */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="relative">
          {replyTo && (
            <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-xs">
              <span>Đang phản hồi <b>{replyTo.user.profile.displayName}</b></span>
              <button type="button" onClick={() => setReplyTo(null)} className="text-primary hover:underline">Hủy</button>
            </div>
          )}
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {user?.profile?.displayName?.[0] || user?.email?.[0]}
            </div>
            <div className="relative flex-1">
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={replyTo ? "Viết phản hồi..." : "Viết bình luận của bạn..."}
                className="pr-12 rounded-2xl bg-secondary/50 focus:bg-background border-none shadow-inner"
              />
              <button 
                type="submit" 
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 text-primary hover:bg-primary/10 transition-colors"
                disabled={!content.trim()}
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border border-dashed p-6 text-center">
          <p className="text-muted-foreground text-sm">Vui lòng đăng nhập để tham gia thảo luận.</p>
          <Button variant="link" className="mt-2">Đăng nhập ngay</Button>
        </div>
      )}

      {/* Comments list */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-secondary" />)}
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-muted-foreground py-10">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="space-y-4">
              <CommentItem 
                comment={comment} 
                onReply={() => setReplyTo(comment)}
                isReply={false}
              />
              
              {/* Replies */}
              {comment.replies?.length > 0 && (
                <div className="ml-12 space-y-4 border-l-2 pl-6">
                  {comment.replies.map((reply: any) => (
                    <CommentItem 
                      key={reply.id} 
                      comment={reply} 
                      onReply={() => setReplyTo(comment)}
                      isReply={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function CommentItem({ comment, onReply, isReply }: { comment: any, onReply: () => void, isReply: boolean }) {
  const profile = comment.user.profile;
  
  return (
    <div className="group flex gap-4">
      <div className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-muted-foreground",
        isReply ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm"
      )}>
        {profile?.displayName?.[0] || comment.user.email?.[0]}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-foreground">{profile?.displayName || comment.user.email}</span>
          <span className="text-[10px] text-muted-foreground">{new Date(comment.createdAt).toLocaleDateString()}</span>
        </div>
        <p className="text-sm leading-relaxed text-foreground/90">{comment.content}</p>
        <div className="flex items-center gap-4 pt-1">
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors">
            <ThumbsUp className="h-3.5 w-3.5" />
            <span>{comment._count?.likes || 0}</span>
          </button>
          {!isReply && (
            <button 
              onClick={onReply}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors"
            >
              <Reply className="h-3.5 w-3.5" />
              <span>Phản hồi</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
