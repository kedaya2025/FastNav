import SettingsForm from '../components/SettingsForm'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">网站设置</h1>
        <p className="text-muted-foreground">
          管理网站的基本信息和SEO设置
        </p>
      </div>
      
      <SettingsForm />
    </div>
  )
}
