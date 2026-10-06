<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class SiteSetting extends Model {
 protected $fillable = ['content'];
 protected function casts(): array { return ['content' => 'array']; }
}
