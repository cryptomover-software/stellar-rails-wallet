namespace :federation do
  desc 'Report Daily New Registrations'
  task report_users: :environment do
    day_start = Time.zone.yesterday.beginning_of_day - 1
    day_end = Time.zone.yesterday.end_of_day - 1
    @federations = Federation.where(created_at: day_start..day_end)
    FederationMailer.with(federations: @federations).report_daily_registrations.deliver_now
  end
end
