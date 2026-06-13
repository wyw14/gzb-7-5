<template>
  <div class="piece-square-page">
    <div class="page-header">
      <div class="container">
        <h1>🎼 曲目广场</h1>
        <p>分享你正在练习的曲子，找到志同道合的练琴搭子一起进步</p>
      </div>
    </div>

    <div class="container">
      <div class="action-bar card mb-20">
        <div class="filter-row">
          <div class="filter-group">
            <label>乐器</label>
            <el-select v-model="filters.instrument" placeholder="全部" clearable style="width: 140px">
              <el-option v-for="inst in instrumentOptions" :key="inst" :label="inst" :value="inst" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>难度</label>
            <el-select v-model="filters.difficulty" placeholder="全部" clearable style="width: 120px">
              <el-option label="初级" value="初级" />
              <el-option label="中级" value="中级" />
              <el-option label="高级" value="高级" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>风格</label>
            <el-select v-model="filters.style" placeholder="全部" clearable style="width: 120px">
              <el-option v-for="s in styleOptions" :key="s" :label="s" :value="s" />
            </el-select>
          </div>
          <div class="filter-group">
            <label>搜索</label>
            <el-input v-model="filters.keyword" placeholder="曲名/作曲家" clearable style="width: 200px" @clear="loadPieces" />
          </div>
          <el-button type="primary" @click="loadPieces">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
        </div>
        <div class="publish-wrapper">
          <el-button type="primary" size="large" @click="goPublish">
            <el-icon><Plus /></el-icon>
            发布练习曲目
          </el-button>
        </div>
      </div>

      <div v-if="pieces.length" class="grid grid-3 gap-20">
        <div v-for="piece in pieces" :key="piece.id" class="piece-card card" @click="goDetail(piece.id)">
          <div class="piece-header">
            <div class="piece-title-row">
              <h3 class="piece-title">{{ piece.title }}</h3>
              <span class="difficulty-tag" :class="piece.difficulty">{{ piece.difficulty }}</span>
            </div>
            <p class="piece-composer" v-if="piece.composer">{{ piece.composer }}</p>
          </div>
          
          <div class="piece-tags">
            <el-tag size="small" type="info">{{ piece.instrument }}</el-tag>
            <el-tag size="small" type="success">{{ piece.style }}</el-tag>
          </div>

          <div class="piece-info" v-if="piece.painPoints">
            <div class="info-label">
              <el-icon><Warning /></el-icon>
              练习痛点
            </div>
            <p class="info-text">{{ piece.painPoints }}</p>
          </div>

          <div class="piece-info" v-if="piece.lookingFor">
            <div class="info-label">
              <el-icon><User /></el-icon>
              寻找搭子
            </div>
            <p class="info-text">{{ piece.lookingFor }}</p>
          </div>

          <div class="piece-progress" v-if="piece.progress !== undefined">
            <div class="progress-header">
              <span>练习进度</span>
              <span class="progress-value">{{ piece.progress }}%</span>
            </div>
            <el-progress :percentage="piece.progress" :show-text="false" :stroke-width="6" />
          </div>

          <div class="piece-footer">
            <div class="user-info" v-if="piece.user">
              <img :src="piece.user.avatar" class="avatar" alt="" />
              <span class="username">{{ piece.user.username }}</span>
              <span class="practice-days">已练 {{ piece.practiceDays || 1 }} 天</span>
            </div>
            <div class="buddies-count" v-if="piece.buddyCount > 0">
              <el-icon><UserFilled /></el-icon>
              {{ piece.buddyCount }} 人同练
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <el-icon size="48"><Headset /></el-icon>
        <p>暂无练习曲目，快来发布第一个吧！</p>
        <el-button type="primary" @click="goPublish" v-if="userStore.isLoggedIn">
          <el-icon><Plus /></el-icon>
          发布练习曲目
        </el-button>
        <el-button type="primary" @click="goLogin" v-else>
          登录后发布
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, inject } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/user'
import { pieceApi } from '../api'
import { ElMessage } from 'element-plus'
import { Search, Plus, Warning, User, UserFilled, Headset } from '@element-plus/icons-vue'

const userStore = useUserStore()
const router = useRouter()
const requireLogin = inject('requireLogin', () => router.push('/login'))

const pieces = ref([])
const filters = reactive({
  instrument: '',
  difficulty: '',
  style: '',
  keyword: ''
})

const instrumentOptions = computed(() => {
  const set = new Set()
  pieces.value.forEach(p => set.add(p.instrument))
  return Array.from(set)
})

const styleOptions = computed(() => {
  const set = new Set()
  pieces.value.forEach(p => set.add(p.style))
  return Array.from(set)
})

const goPublish = () => {
  if (!userStore.isLoggedIn) {
    requireLogin()
    return
  }
  router.push('/pieces/publish')
}

const goLogin = () => {
  router.push('/login')
}

const goDetail = (id) => {
  router.push(`/pieces/${id}`)
}

const loadPieces = async () => {
  try {
    const params = {}
    if (filters.instrument) params.instrument = filters.instrument
    if (filters.difficulty) params.difficulty = filters.difficulty
    if (filters.style) params.style = filters.style
    if (filters.keyword) params.keyword = filters.keyword

    const allPieces = await pieceApi.list(params)
    const piecesWithBuddies = allPieces.map(p => {
      const buddyCount = allPieces.filter(pp => pp.title === p.title && pp.userId !== p.userId).length
      return { ...p, buddyCount }
    })
    pieces.value = piecesWithBuddies
  } catch (e) {
    ElMessage.error('加载曲目失败')
  }
}

onMounted(() => {
  loadPieces()
})
</script>

<style scoped>
.page-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 0;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 32px;
  margin: 0 0 10px;
}

.page-header p {
  margin: 0;
  opacity: 0.9;
}

.action-bar {
  padding: 20px 24px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.filter-group label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.publish-wrapper {
  margin-left: auto;
}

.piece-card {
  padding: 24px;
  cursor: pointer;
  transition: all 0.3s;
}

.piece-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.piece-header {
  margin-bottom: 12px;
}

.piece-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
}

.piece-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.piece-composer {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 0;
}

.difficulty-tag {
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.difficulty-tag.初级 {
  background: #d1fae5;
  color: #065f46;
}

.difficulty-tag.中级 {
  background: #fef3c7;
  color: #92400e;
}

.difficulty-tag.高级 {
  background: #fee2e2;
  color: #991b1b;
}

.piece-tags {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.piece-info {
  margin-bottom: 12px;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 4px;
}

.info-text {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.piece-progress {
  margin: 16px 0;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: var(--text-secondary);
}

.progress-value {
  font-weight: 600;
  color: var(--primary-color);
}

.piece-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

.practice-days {
  font-size: 12px;
  color: var(--text-secondary);
}

.buddies-count {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--primary-color);
  font-weight: 500;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--text-secondary);
}

.empty-state .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
  color: var(--text-muted);
}

.empty-state p {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .grid-3 {
    grid-template-columns: 1fr;
  }

  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .publish-wrapper {
    margin-left: 0;
  }
}
</style>
