import { Component } from '@angular/core';
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface User {
  id: number
  name: string
  avatar: string
  isOnline: boolean
}

interface Comment {
  id: number
  userId: number
  content: string
  timestamp: Date
}

interface Post {
  id: number
  userId: number
  content: string
  image?: string
  likes: number
  comments: Comment[]
  timestamp: Date
  hasLiked: boolean
}
@Component({
  selector: 'app-social-feed',
  templateUrl: './social-feed.component.html',
  styleUrls: ['./social-feed.component.scss']
})
export class SocialFeedComponent {
  currentUser: User = {
    id: 1,
    name: "John Doe",
    avatar: "https://i.pravatar.cc/150?img=1",
    isOnline: true,
  }

  users: User[] = [
    this.currentUser,
    { id: 2, name: "Jane Smith", avatar: "https://i.pravatar.cc/150?img=2", isOnline: true },
    { id: 3, name: "Mike Johnson", avatar: "https://i.pravatar.cc/150?img=3", isOnline: false },
    { id: 4, name: "Sarah Williams", avatar: "https://i.pravatar.cc/150?img=4", isOnline: true },
    { id: 5, name: "Alex Brown", avatar: "https://i.pravatar.cc/150?img=5", isOnline: false },
  ]

  posts: Post[] = [
    {
      id: 1,
      userId: 2,
      content: "Belle journée aujourd'hui! Qui veut aller à la plage?",
      image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e",
      likes: 15,
      comments: [{ id: 1, userId: 3, content: "Superbe idée!", timestamp: new Date(Date.now() - 3600000) }],
      timestamp: new Date(Date.now() - 7200000),
      hasLiked: false,
    },
    {
      id: 2,
      userId: 3,
      content: "Je viens de terminer un nouveau projet. Qu'en pensez-vous?",
      image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
      likes: 8,
      comments: [],
      timestamp: new Date(Date.now() - 86400000),
      hasLiked: true,
    },
  ]

  newPostContent = ""
  newCommentContents: { [postId: number]: string } = {}
  selectedUser: User | null = null
  messageContent = ""
  messages: { userId: number; content: string; fromMe: boolean }[] = []

  getUserById(id: number): User {
    return this.users.find((user) => user.id === id) || this.users[0]
  }

  addPost() {
    if (!this.newPostContent.trim()) return

    const newPost: Post = {
      id: this.posts.length + 1,
      userId: this.currentUser.id,
      content: this.newPostContent,
      likes: 0,
      comments: [],
      timestamp: new Date(),
      hasLiked: false,
    }

    this.posts.unshift(newPost)
    this.newPostContent = ""
  }

  toggleLike(post: Post) {
    if (post.hasLiked) {
      post.likes--
    } else {
      post.likes++
    }
    post.hasLiked = !post.hasLiked
  }

  addComment(post: Post) {
    const content = this.newCommentContents[post.id]
    if (!content || !content.trim()) return

    const newComment: Comment = {
      id: post.comments.length + 1,
      userId: this.currentUser.id,
      content: content,
      timestamp: new Date(),
    }

    post.comments.push(newComment)
    this.newCommentContents[post.id] = ""
  }

  selectUser(user: User) {
    if (user.id === this.currentUser.id) return
    this.selectedUser = user
  }

  sendMessage() {
    if (!this.selectedUser || !this.messageContent.trim()) return

    this.messages.push({
      userId: this.selectedUser.id,
      content: this.messageContent,
      fromMe: true,
    })

    // Simuler une réponse
    setTimeout(() => {
      this.messages.push({
        userId: this.selectedUser!.id,
        content: "Merci pour votre message!",
        fromMe: false,
      })
    }, 1000)

    this.messageContent = ""
  }

  sharePost(post: Post) {
    alert(`Post partagé: ${post.content.substring(0, 30)}...`)
  }
}
