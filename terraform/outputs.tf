output "instance_public_ip" {
  description = "Public IP after deployment"
  value       = aws_instance.web.public_ip
}
