terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

provider "cloudflare" {
}

variable "account_id" {}
variable "kv_namespace_id" {}
variable "kv_title" {}

# kv namespace behind the SESSION binding (Notion + GitHub cache)
resource "cloudflare_workers_kv_namespace" "session" {
  account_id = var.account_id
  title      = var.kv_title

  lifecycle {
    prevent_destroy = true
  }
}